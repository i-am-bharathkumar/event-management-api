const { pool } = require('../config/database');

class Event {
  static async create(eventData) {
    const { title, datetime, location, capacity } = eventData;
    const query = `
      INSERT INTO events (title, datetime, location, capacity)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [title, datetime, location, capacity]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT e.*, 
             COUNT(er.user_id) as current_registrations,
             JSON_AGG(
               CASE 
                 WHEN u.id IS NOT NULL 
                 THEN JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'email', u.email)
                 ELSE NULL
               END
             ) FILTER (WHERE u.id IS NOT NULL) as registered_users
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      LEFT JOIN users u ON er.user_id = u.id
      WHERE e.id = $1
      GROUP BY e.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findUpcoming() {
    const query = `
      SELECT e.*, 
             COUNT(er.user_id) as current_registrations
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.datetime > NOW()
      GROUP BY e.id
      ORDER BY e.datetime ASC, e.location ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async register(eventId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if event exists and is future
      const eventQuery = 'SELECT * FROM events WHERE id = $1';
      const eventResult = await client.query(eventQuery, [eventId]);
      if (eventResult.rows.length === 0) {
        throw new Error('Event not found');
      }

      const event = eventResult.rows[0];
      if (new Date(event.datetime) <= new Date()) {
        throw new Error('Cannot register for past events');
      }

      // Check current registrations
      const countQuery = 'SELECT COUNT(*) FROM event_registrations WHERE event_id = $1';
      const countResult = await client.query(countQuery, [eventId]);
      const currentRegistrations = parseInt(countResult.rows[0].count);

      if (currentRegistrations >= event.capacity) {
        throw new Error('Event is full');
      }

      // Check if user already registered
      const existingQuery = 'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2';
      const existingResult = await client.query(existingQuery, [eventId, userId]);
      if (existingResult.rows.length > 0) {
        throw new Error('User already registered for this event');
      }

      // Register user
      const registerQuery = `
        INSERT INTO event_registrations (event_id, user_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await client.query(registerQuery, [eventId, userId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async cancelRegistration(eventId, userId) {
    const query = `
      DELETE FROM event_registrations
      WHERE event_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [eventId, userId]);
    if (result.rows.length === 0) {
      throw new Error('Registration not found');
    }
    return result.rows[0];
  }

  static async getStats(eventId) {
    const query = `
      SELECT 
        e.capacity,
        COUNT(er.user_id) as total_registrations,
        (e.capacity - COUNT(er.user_id)) as remaining_capacity,
        ROUND(
          (COUNT(er.user_id)::DECIMAL / e.capacity) * 100, 2
        ) as percentage_used
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.id = $1
      GROUP BY e.id, e.capacity
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows[0];
  }
}

module.exports = Event;