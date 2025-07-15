const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { validateEvent, validateRegistration } = require('../middleware/validation');

// Create event
router.post('/', validateEvent, async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { eventId: event.id }
    });
  } catch (error) {
    next(error);
  }
});

// Get event details
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        datetime: event.datetime,
        location: event.location,
        capacity: event.capacity,
        currentRegistrations: parseInt(event.current_registrations),
        registeredUsers: event.registered_users || []
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register for event
router.post('/:id/register', validateRegistration, async (req, res, next) => {
  try {
    const registration = await Event.register(req.params.id, req.body.userId);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: registration
    });
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Cannot register for past events' || 
        error.message === 'Event is full' || 
        error.message === 'User already registered for this event') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
});

// Cancel registration
router.delete('/:id/register', validateRegistration, async (req, res, next) => {
  try {
    await Event.cancelRegistration(req.params.id, req.body.userId);
    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    if (error.message === 'Registration not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
});

// List upcoming events
router.get('/', async (req, res, next) => {
  try {
    const events = await Event.findUpcoming();
    res.json({
      success: true,
      data: events.map(event => ({
        id: event.id,
        title: event.title,
        datetime: event.datetime,
        location: event.location,
        capacity: event.capacity,
        currentRegistrations: parseInt(event.current_registrations)
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get event stats
router.get('/:id/stats', async (req, res, next) => {
  try {
    const stats = await Event.getStats(req.params.id);
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        totalRegistrations: parseInt(stats.total_registrations),
        remainingCapacity: parseInt(stats.remaining_capacity),
        percentageUsed: parseFloat(stats.percentage_used)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;