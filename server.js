const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(express.json()); // for JSON body parsing

// Register routes
app.use('/users', userRoutes); // /users/:id/events/count

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
