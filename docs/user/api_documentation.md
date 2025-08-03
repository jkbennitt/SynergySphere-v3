
# 🔌 API Documentation

> **Version 1.0** | **RESTful API Reference**

<details>
<summary><strong>📖 Table of Contents</strong></summary>

- [Introduction](#-introduction)
- [Authentication](#-authentication)
- [Base URL](#-base-url)
- [Endpoints](#-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Solution Endpoints](#solution-endpoints)
  - [Climate Data Endpoints](#climate-data-endpoints)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Change Log](#-change-log)

</details>

---

## 📋 Introduction

The Synergy Sphere API provides programmatic access to climate solutions data, user management, and community features. This RESTful API uses JSON for data exchange and JWT tokens for authentication.

---

## 🔐 Authentication

### JWT Token Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Obtaining a Token

Use the login endpoint to obtain a JWT token:

```bash
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

---

## 🌐 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## 📊 Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### User Endpoints

#### GET /users/:id
Get user profile by ID.

**Parameters:**
- `id` (integer): User ID

**Response (200):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Climate researcher passionate about renewable energy",
  "location": "San Francisco, CA",
  "createdAt": "2025-01-27T00:00:00Z"
}
```

#### PUT /users/:id
Update user profile (requires authentication as the user).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Updated bio",
  "location": "New York, NY"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "bio": "Updated bio",
    "location": "New York, NY"
  }
}
```

### Solution Endpoints

#### GET /solutions
Get all public solutions with optional filtering.

**Query Parameters:**
- `category` (string): Filter by solution category
- `location` (string): Filter by geographic location
- `search` (string): Search in title and description
- `limit` (integer): Number of results per page (default: 20)
- `offset` (integer): Pagination offset (default: 0)

**Example Request:**
```bash
GET /api/solutions?category=renewable-energy&limit=10&offset=0
```

**Response (200):**
```json
{
  "solutions": [
    {
      "id": 1,
      "title": "Community Solar Farm Initiative",
      "description": "Distributed solar energy for rural communities",
      "category": "renewable-energy",
      "location": "Rural California",
      "impactMetrics": {
        "co2Reduction": 1500,
        "timeframe": "2 years"
      },
      "userId": 1,
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2025-01-27T00:00:00Z",
      "updatedAt": "2025-01-27T00:00:00Z"
    }
  ],
  "total": 45,
  "hasMore": true
}
```

#### GET /solutions/:id
Get solution by ID.

**Parameters:**
- `id` (integer): Solution ID

**Response (200):**
```json
{
  "id": 1,
  "title": "Community Solar Farm Initiative",
  "description": "Distributed solar energy for rural communities",
  "category": "renewable-energy",
  "location": "Rural California",
  "impactMetrics": {
    "co2Reduction": 1500,
    "timeframe": "2 years",
    "investmentRequired": 250000,
    "jobsCreated": 15
  },
  "collaborationSettings": {
    "isOpen": true,
    "skillsNeeded": ["Engineering", "Finance", "Project Management"]
  },
  "userId": 1,
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "createdAt": "2025-01-27T00:00:00Z",
  "updatedAt": "2025-01-27T00:00:00Z"
}
```

#### POST /solutions
Create a new solution (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Urban Vertical Farming System",
  "description": "Sustainable food production in urban environments",
  "category": "agriculture",
  "location": "Urban Areas",
  "impactMetrics": {
    "co2Reduction": 800,
    "timeframe": "1 year",
    "investmentRequired": 150000
  },
  "collaborationSettings": {
    "isOpen": true,
    "skillsNeeded": ["Agriculture", "Engineering", "Business"]
  }
}
```

**Response (201):**
```json
{
  "message": "Solution created successfully",
  "solution": {
    "id": 2,
    "title": "Urban Vertical Farming System",
    "shareableLink": "abc123def456",
    "userId": 1,
    "createdAt": "2025-01-27T00:00:00Z"
  }
}
```

#### PUT /solutions/:id
Update solution (requires authentication as solution owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (Same as POST /solutions)

**Response (200):**
```json
{
  "message": "Solution updated successfully",
  "solution": {
    "id": 2,
    "title": "Urban Vertical Farming System",
    "updatedAt": "2025-01-27T00:00:00Z"
  }
}
```

#### DELETE /solutions/:id
Delete solution (requires authentication as solution owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Solution deleted successfully"
}
```

#### GET /users/:id/solutions
Get solutions by user ID.

**Parameters:**
- `id` (integer): User ID

**Response (200):**
```json
{
  "solutions": [
    {
      "id": 1,
      "title": "Community Solar Farm Initiative",
      "category": "renewable-energy",
      "createdAt": "2025-01-27T00:00:00Z"
    }
  ],
  "total": 3
}
```

### Climate Data Endpoints

#### GET /climate/co2-emissions
Get CO2 emissions data by country/region.

**Query Parameters:**
- `country` (string): ISO country code (optional)
- `year` (integer): Specific year (optional)
- `startYear` (integer): Start year for range (optional)
- `endYear` (integer): End year for range (optional)

**Response (200):**
```json
{
  "US": {
    "emissions": 5416,
    "population": 331900000,
    "emissionsPerCapita": 16.3,
    "year": 2023
  },
  "CN": {
    "emissions": 10707,
    "population": 1439323776,
    "emissionsPerCapita": 7.4,
    "year": 2023
  }
}
```

#### GET /climate/temperature-trends
Get global temperature trend data.

**Query Parameters:**
- `region` (string): Specific region (optional)
- `startYear` (integer): Start year for range (optional)
- `endYear` (integer): End year for range (optional)

**Response (200):**
```json
{
  "global": [
    {
      "year": 2023,
      "temperature": 1.15,
      "anomaly": 1.15
    },
    {
      "year": 2022,
      "temperature": 1.06,
      "anomaly": 1.06
    }
  ]
}
```

---

## ⚠️ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid or missing token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Validation errors |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_CREDENTIALS` | Login failed | Check email and password |
| `TOKEN_EXPIRED` | JWT token expired | Refresh token or login again |
| `VALIDATION_ERROR` | Input validation failed | Check required fields |
| `RESOURCE_NOT_FOUND` | Requested resource not found | Verify resource ID |
| `PERMISSION_DENIED` | Insufficient permissions | Check user authorization |

---

## 🚦 Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **Burst Limit**: 10 requests per second

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1611123456
```

When rate limit is exceeded:

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "resetTime": "2025-01-27T12:00:00Z"
  }
}
```

---

## 📝 Change Log

| **Version** | **Date** | **Changes** |
|-------------|----------|-------------|
| **1.0** | 2025-01-27 | Initial API documentation |

---

> **Status**: Active and maintained

*Last updated: 2025-01-27*
