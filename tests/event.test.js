const request = require('supertest');
const app = require('../server');

describe('Event Management API', () => {
  let userId;
  let eventId;

  // Setup: Create a test user
  beforeAll(async () => {
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'test@example.com'
      });
    userId = userResponse.body.data.id;
  });

  describe('POST /api/events', () => {
    it('should create an event successfully', async () => {
      const eventData = {
        title: 'Test Event',
        datetime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        location: 'Test Location',
        capacity: 100
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventId).toBeDefined();
      eventId = response.body.data.eventId;
    });

    it('should reject event with invalid capacity', async () => {
      const eventData = {
        title: 'Test Event',
        datetime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Test Location',
        capacity: 1001 // Invalid capacity
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject past event', async () => {
      const eventData = {
        title: 'Past Event',
        datetime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        location: 'Test Location',
        capacity: 100
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should get event details', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/events/:id/register', () => {
    it('should register user for event', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .send({ userId })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should prevent duplicate registration', async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .send({ userId })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });
  });

  describe('GET /api/events/:id/stats', () => {
    it('should get event statistics', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRegistrations).toBe(1);
      expect(response.body.data.remainingCapacity).toBe(99);
    });
  });

  describe('DELETE /api/events/:id/register', () => {
    it('should cancel registration', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}/register`)
        .send({ userId })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent registration', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}/register`)
        .send({ userId })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
