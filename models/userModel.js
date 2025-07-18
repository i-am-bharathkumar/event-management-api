const pool = require('../db');

const getEventCountForUser = async (userId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS event_count
     FROM registrations
     WHERE user_id = $1
     AND registered_at >= NOW() - INTERVAL '30 days'`,
    [userId]
  );
  return parseInt(result.rows[0].event_count, 10);
};

module.exports = { getEventCountForUser };
