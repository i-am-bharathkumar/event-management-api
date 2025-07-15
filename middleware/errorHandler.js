const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // PostgreSQL errors
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry'
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Referenced resource not found'
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
    }
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;