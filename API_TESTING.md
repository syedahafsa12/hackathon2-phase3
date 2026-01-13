# API Testing Guide

This document provides comprehensive testing instructions for the Todo App API.

## Quick Start

1. Start the backend server:

```bash
cd backend
uvicorn app.main:app --reload
```

2. Visit http://localhost:8001/docs for interactive API documentation

## Authentication Flow

### 1. Register New User

**Endpoint:** `POST /auth/signup`

**Request:**

```json
{
  "email": "test@example.com",
  "password": "securepassword123",
  "name": "Test User"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "uuid-string",
    "email": "test@example.com",
    "name": "Test User",
    "created_at": "2025-01-01T00:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-01-08T00:00:00"
}
```

### 2. Login

**Endpoint:** `POST /auth/login`

**Request:**

```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response (200):** Same as signup

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "id": "uuid-string",
  "email": "test@example.com",
  "name": "Test User",
  "created_at": "2025-01-01T00:00:00"
}
```

## Task Management

### Create Task

**Endpoint:** `POST /tasks`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high",
  "category": "Work",
  "due_date": "2025-01-10T17:00:00",
  "estimated_minutes": 120,
  "tag_ids": [1, 2]
}
```

**Response (201):**

```json
{
  "id": 1,
  "user_id": "uuid-string",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "completed": false,
  "priority": "high",
  "category": "Work",
  "due_date": "2025-01-10T17:00:00",
  "estimated_minutes": 120,
  "tags": [
    {
      "id": 1,
      "name": "urgent",
      "color": "#EF4444"
    }
  ],
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

### List Tasks with Filters

**Endpoint:** `GET /tasks`

**Query Parameters:**

- `completed` (boolean): Filter by completion status
- `priority` (string): Filter by priority (high, medium, low)
- `category` (string): Filter by category
- `search` (string): Search in title and description
- `tag_ids` (array): Filter by tag IDs
- `sort_by` (string): Sort field (created_at, due_date, priority, title)
- `sort_order` (string): Sort direction (asc, desc)
- `skip` (number): Pagination offset
- `limit` (number): Pagination limit (max 1000)

**Example Request:**

```
GET /tasks?completed=false&priority=high&search=documentation&sort_by=due_date&sort_order=asc
```

**Response (200):**

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project documentation",
      ...
    }
  ],
  "total": 1,
  "completed": 0,
  "pending": 1
}
```

### Update Task

**Endpoint:** `PATCH /tasks/{id}`

**Request (partial update):**

```json
{
  "completed": true
}
```

**Response (200):** Updated task object

### Delete Task

**Endpoint:** `DELETE /tasks/{id}`

**Response (204):** No content

### Bulk Operations

**Bulk Delete:**

```
POST /tasks/bulk-delete
Content-Type: application/json

[1, 2, 3]
```

**Bulk Update:**

```
PATCH /tasks/bulk-update?task_ids=1&task_ids=2&task_ids=3
Content-Type: application/json

{
  "completed": true
}
```

## Tag Management

### Create Tag

**Endpoint:** `POST /tags`

**Request:**

```json
{
  "name": "urgent",
  "color": "#EF4444"
}
```

**Response (201):**

```json
{
  "id": 1,
  "user_id": "uuid-string",
  "name": "urgent",
  "color": "#EF4444",
  "created_at": "2025-01-01T00:00:00"
}
```

### List Tags

**Endpoint:** `GET /tags`

**Response (200):**

```json
[
  {
    "id": 1,
    "user_id": "uuid-string",
    "name": "urgent",
    "color": "#EF4444",
    "created_at": "2025-01-01T00:00:00"
  }
]
```

### Update Tag

**Endpoint:** `PATCH /tags/{id}`

**Request:**

```json
{
  "name": "critical",
  "color": "#DC2626"
}
```

### Delete Tag

**Endpoint:** `DELETE /tags/{id}`

**Response (204):** No content

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized

```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "detail": "Not authorized to access this task"
}
```

### 404 Not Found

```json
{
  "detail": "Task not found"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 429 Rate Limit Exceeded

```json
{
  "detail": "Rate limit exceeded: 5 per 15 minutes"
}
```

## Testing with cURL

### Signup

```bash
curl -X POST http://localhost:8001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123",
    "name": "Test User"
  }'
```

### Create Task

```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:8001/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Task",
    "priority": "high"
  }'
```

### List Tasks

```bash
curl http://localhost:8001/tasks?completed=false \
  -H "Authorization: Bearer $TOKEN"
```

## Rate Limiting

The following endpoints have rate limits:

- `POST /auth/signup`: 3 requests per hour per IP
- `POST /auth/login`: 5 requests per 15 minutes per IP

When rate limited, you'll receive a 429 status code with a `Retry-After` header.

## Testing Checklist

- [ ] User can signup with valid credentials
- [ ] Signup rejects duplicate emails
- [ ] Signup rejects weak passwords (<8 chars)
- [ ] User can login with correct credentials
- [ ] Login rejects incorrect credentials
- [ ] User can create tasks with all fields
- [ ] User can filter tasks by status, priority, category
- [ ] User can search tasks by title/description
- [ ] User can sort tasks by different fields
- [ ] User can update task completion status
- [ ] User can delete tasks
- [ ] User can perform bulk operations
- [ ] User can create, update, delete tags
- [ ] User cannot access other users' data
- [ ] Rate limiting works on auth endpoints
- [ ] All validation errors return proper messages
