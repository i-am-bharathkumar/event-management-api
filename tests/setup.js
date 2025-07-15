const { pool } = require('../config/database');

beforeAll(async () => {
  // Setup test database
  await pool.query(`
    TRUNCATE TABLE event_registrations, events, users RESTART IDENTITY CASCADE;
  `);
});

afterAll(async () => {
  // Cleanup
  await pool.end();
});