# Event Management API

A comprehensive REST API for managing events and user registrations built with Node.js, Express, and PostgreSQL.

## Features

- **Event Management**: Create, view, and manage events with capacity limits
- **User Registration**: Register users for events with duplicate and capacity validation
- **Registration Management**: Cancel registrations with proper error handling
- **Smart Filtering**: List only upcoming events with custom sorting
- **Statistics**: Real-time event statistics and capacity tracking
- **Concurrent Safety**: Handle multiple simultaneous registrations
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Meaningful error messages with proper HTTP status codes

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=event_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Events

#### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "datetime": "2024-12-15T10:00:00.000Z",
  "location": "Convention Center",
  "capacity": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "eventId": 1
  }
}
```

#### Get Event Details
```http
GET /api/events/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tech Conference 2024",
    "datetime": "2024-12-15T10:00:00.000Z",
    "location": "Convention Center",
    "capacity": 500,
    "currentRegistrations": 25,
    "registeredUsers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
}
```

#### Register for Event
```http
POST /api/events/{id}/register
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 1,
    "event_id": 1,
    "user_id": 1,
    "registered_at": "2024-07-15T10:30:00.000Z"
  }
}
```

#### Cancel Registration
```http
DELETE /api/events/{id}/register
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

#### List Upcoming Events
```http
GET /api/events
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Tech Conference 2024",
      "datetime": "2024-12-15T10:00:00.000Z",
      "location": "Convention Center",
      "capacity": 500,
      "currentRegistrations": 25
    }
  ]
}
```

#### Get Event Statistics
```http
GET /api/events/{id}/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRegistrations": 25,
    "remainingCapacity": 475,
    "percentageUsed": 5.00
  }
}
```

### Users

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-07-15T10:00:00.000Z"
  }
}
```

#### Get All Users
```http
GET /api/users
```

#### Get User by ID
```http
GET /api/users/{id}
```

## Business Logic

### Event Validation
- **Capacity**: Must be positive and ≤ 1000
- **Date/Time**: Must be in ISO format and in the future
- **Required Fields**: Title, datetime, location, capacity

### Registration Rules
- **No Duplicates**: Users cannot register for the same event twice
- **Capacity Limits**: Cannot register if event is at full capacity
- **Past Events**: Cannot register for events that have already occurred
- **Concurrent Safety**: Database transactions ensure consistency

### Custom Sorting
Upcoming events are sorted by:
1. **Date** (ascending) - earliest events first
2. **Location** (alphabetically) - for events on the same date

## Error Handling

The API returns consistent error responses with appropriate HTTP status codes:

```json
{
  "success": false,
  "message": "Error description",
  "details": "Additional error details (when applicable)"
}
```

### Common Error Codes
- **400 Bad Request**: Invalid input, validation errors, business rule violations
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate entries
- **500 Internal Server Error**: Server errors

## Database Schema

### Tables

**users**
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**events**
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(255) NOT NULL)
- `datetime` (TIMESTAMP NOT NULL)
- `location` (VARCHAR(255) NOT NULL)
- `capacity` (INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000))
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**event_registrations**
- `id` (SERIAL PRIMARY KEY)
- `event_id` (INTEGER REFERENCES events(id) ON DELETE CASCADE)
- `user_id` (INTEGER REFERENCES users(id) ON DELETE CASCADE)
- `registered_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `UNIQUE(event_id, user_id)`

### Indexes
- `idx_events_datetime` on `events(datetime)`
- `idx_events_location` on `events(location)`
- `idx_event_registrations_event_id` on `event_registrations(event_id)`
- `idx_event_registrations_user_id` on `event_registrations(user_id)`

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-origin resource sharing enabled
- **Helmet**: Security headers protection
- **Input Validation**: Comprehensive validation using Joi
- **SQL Injection Protection**: Parameterized queries

## Testing

Run the test suite:
```bash
npm test
```

## API Testing Examples

### Using cURL

**Create a user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

**Create an event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024",
    "datetime": "2024-12-15T10:00:00.000Z",
    "location": "Convention Center",
    "capacity": 500
  }'
```

**Register for an event:**
```bash
curl -X POST http://localhost:3000/api/events/1/register \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### Using Postman

1. Import the provided collection (if available)
2. Set the base URL to `http://localhost:3000`
3. Test each endpoint with the example payloads above

## Architecture

### Project Structure
```
event-management-api/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── validation.js        # Request validation middleware
├── models/
│   ├── Event.js            # Event model with business logic
│   └── User.js             # User model
├── routes/
│   ├── eventRoutes.js      # Event endpoints
│   └── userRoutes.js       # User endpoints
├── scripts/
│   └── setup-database.js   # Database setup script
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Dependencies and scripts
├── server.js              # Main application file
└── README.md              # This file
```

### Design Patterns

**MVC Architecture**: Separation of concerns with models, routes (controllers), and middleware

**Repository Pattern**: Database operations encapsulated in model classes

**Middleware Pattern**: Request processing pipeline with validation, error handling, and security

**Transaction Pattern**: Database transactions for concurrent operations

## Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried columns
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Efficient joins and aggregations

### Caching Strategy
- **Database Connection Pool**: Reuse database connections
- **Query Result Caching**: Can be implemented with Redis for high-traffic scenarios

### Concurrent Operations
- **Database Transactions**: Ensure data consistency during concurrent registrations
- **Optimistic Locking**: Prevent race conditions in registration process

## Deployment

### Environment Setup

**Development**
```bash
NODE_ENV=development
npm run dev
```

**Production**
```bash
NODE_ENV=production
npm start
```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: event_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | event_management |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `NODE_ENV` | Environment | development |

## Monitoring and Logging

### Health Check
```http
GET /health
```

Returns server status and timestamp for monitoring tools.

### Logging
- **Console Logging**: Development environment
- **File Logging**: Can be configured for production
- **Error Tracking**: Integrated error handling with detailed logging

## API Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Response**: 429 Too Many Requests when limit exceeded
- **Headers**: Rate limit information in response headers

## Validation Rules

### Event Validation
- **Title**: Required, 1-255 characters
- **DateTime**: Required, ISO format, future date
- **Location**: Required, 1-255 characters
- **Capacity**: Required, integer, 1-1000

### User Validation
- **Name**: Required, 1-255 characters
- **Email**: Required, valid email format, unique

### Registration Validation
- **UserId**: Required, positive integer

## Error Scenarios

### Event Creation Errors
```json
{
  "success": false,
  "message": "Validation error",
  "details": "\"capacity\" must be less than or equal to 1000"
}
```

### Registration Errors
```json
{
  "success": false,
  "message": "Event is full"
}
```

```json
{
  "success": false,
  "message": "User already registered for this event"
}
```

```json
{
  "success": false,
  "message": "Cannot register for past events"
}
```

## Advanced Features

### Concurrent Registration Handling
The API uses database transactions to handle concurrent registrations safely:

1. **Transaction Start**: Begin database transaction
2. **Capacity Check**: Verify event capacity within transaction
3. **Registration Insert**: Add registration record
4. **Commit/Rollback**: Commit on success, rollback on failure

### Custom Sorting Algorithm
Events are sorted using a custom comparator:
```javascript
ORDER BY e.datetime ASC, e.location ASC
```

This ensures:
- Earlier events appear first
- Events on the same date are sorted alphabetically by location

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the error messages and status codes

## Changelog

### v1.0.0
- Initial release
- Complete event management functionality
- User registration system
- Comprehensive validation and error handling
- Database setup and migrations
- API documentation

## Future Enhancements

- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Email Notifications**: Registration confirmations
- **Event Categories**: Event categorization and filtering
- **Search**: Full-text search functionality
- **Analytics**: Event statistics and reporting
- **File Upload**: Event image uploads
- **Caching**: Redis-based caching layer
- **Testing**: Comprehensive test coverage
- **API Documentation**: OpenAPI/Swagger documentation
