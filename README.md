# 📊 Event Count API

A simple Node.js + Express + PostgreSQL API that accepts a **User ID** and returns the **number of events the user has registered for in the past month**.

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **pg** (Node PostgreSQL client)
- **body-parser**

---

## 📁 Folder Structure

```

event-management-api/
├── models/
│   └── userModel.js
├── routes/
│   └── userRoutes.js
├── db.js
├── server.js
└── package.json

````

---

## 🧪 API Endpoint

### `GET /api/users/:userId/event-count`

#### ✅ Description:
Returns the number of events the specified user has registered for **in the past 30 days**.

#### 📥 Example Request:
```http
GET /api/users/1/event-count
````

#### 📤 Example Response:

```json
{
  "userId": "1",
  "eventCount": 2
}
```

---

## 🛠️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/i-am-bharathkumar/event-management-api.git
cd event-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure PostgreSQL connection

In `db.js`, make sure your credentials match your setup:

```js
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'event_count',
  password: 'your_postgres_password',
  port: 5173,
});
```

### 4. Run the server

```bash
node server.js
```

---

## 🗃️ PostgreSQL Schema

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL
);

-- events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  date DATE NOT NULL
);

-- registrations table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  event_id INT REFERENCES events(id),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧑‍💻 Author

**Bharath Kumar**
GitHub: [@i-am-bharathkumar](https://github.com/i-am-bharathkumar)

---

## 📄 License

This project is licensed under the MIT License.

````

---

### ✅ To use it:

1. Save this as `README.md` in the root folder (`event-management-api/`).
2. Run:
```bash
git add README.md
git commit -m "Add project README"
git push
````


