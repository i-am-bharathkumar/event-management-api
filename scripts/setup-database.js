const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default database first
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
  try {
    // Create database if it doesn't exist
    await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    } else {
      throw error;
    }
  }

  // Connect to the new database
  const appPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  // Create tables
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      datetime TIMESTAMP NOT NULL,
      location VARCHAR(255) NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_datetime ON events(datetime);
    CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
    CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
  `;

  await appPool.query(createTablesQuery);
  console.log('Database tables created successfully');

  await pool.end();
  await appPool.end();
}

setupDatabase().catch(console.error);