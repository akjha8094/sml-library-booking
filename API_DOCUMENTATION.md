# API Documentation

This document provides comprehensive documentation for the Smart Library Booking System API.

## Base URL

```
http://localhost:5000/api
```

For production deployments, replace with your actual domain.

## Authentication

Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## API Endpoints

### Authentication

#### User Registration
```
POST /auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "password": "password123",
  "dob": "1990-01-01",
  "gender": "Male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "dob": "1990-01-01",
    "gender": "Male",
    "is_verified": false,
    "wallet_balance": 0
  },
  "token": "jwt-token"
}
```

#### User Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "dob": "1990-01-01",
    "gender": "Male",
    "is_verified": true,
    "wallet_balance": 0
  },
  "token": "jwt-token"
}
```

#### Admin Login
```
POST /auth/admin/login
```

**Request Body:**
```json
{
  "email": "admin@smartlibrary.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "admin": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@smartlibrary.com",
    "role": "super_admin",
    "is_active": true
  },
  "token": "jwt-token"
}
```

#### Forgot Password
```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

#### Reset Password
```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Management

#### Get User Profile
```
GET /user/profile
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "dob": "1990-01-01",
    "gender": "Male",
    "profile_image": null,
    "is_verified": true,
    "wallet_balance": 0,
    "referral_code": "ABC123",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Update User Profile
```
PUT /user/profile
```

**Request Body:**
```json
{
  "name": "John Smith",
  "mobile": "0987654321",
  "dob": "1990-01-01",
  "gender": "Male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "mobile": "0987654321",
    "dob": "1990-01-01",
    "gender": "Male",
    "profile_image": null,
    "is_verified": true,
    "wallet_balance": 0,
    "referral_code": "ABC123",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Seat Management

#### Get Available Seats
```
GET /seats
```

**Response:**
```json
{
  "success": true,
  "seats": [
    {
      "id": 1,
      "seat_number": "S01",
      "seat_status": "available",
      "floor": 1,
      "section": null
    },
    {
      "id": 2,
      "seat_number": "S02",
      "seat_status": "occupied",
      "floor": 1,
      "section": null
    }
  ]
}
```

### Plan Management

#### Get All Plans
```
GET /plans
```

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "id": 1,
      "name": "Monthly Full Day",
      "description": "Access to library for full day, 30 days",
      "price": 1500,
      "duration_days": 30,
      "plan_type": "full_day",
      "shift_type": "all_day",
      "shift_start_time": "06:00:00",
      "shift_end_time": "22:00:00",
      "is_active": true,
      "features": null
    }
  ]
}
```

### Booking Management

#### Get User Bookings
```
GET /bookings
```

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 1,
      "user_id": 1,
      "plan_id": 1,
      "seat_id": 1,
      "booking_date": "2025-01-01",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "booking_type": "immediate",
      "status": "active",
      "total_amount": 1500,
      "discount_amount": 0,
      "final_amount": 1500,
      "coupon_id": null,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create New Booking
```
POST /bookings
```

**Request Body:**
```json
{
  "plan_id": 1,
  "seat_id": 1,
  "start_date": "2025-02-01",
  "end_date": "2025-02-28"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": 2,
    "user_id": 1,
    "plan_id": 1,
    "seat_id": 1,
    "booking_date": "2025-01-15",
    "start_date": "2025-02-01",
    "end_date": "2025-02-28",
    "booking_type": "advance",
    "status": "pending",
    "total_amount": 1500,
    "discount_amount": 0,
    "final_amount": 1500,
    "coupon_id": null,
    "created_at": "2025-01-15T00:00:00.000Z"
  }
}
```

### Payment Management

#### Process Payment
```
POST /payments/process
```

**Request Body:**
```json
{
  "booking_id": 2,
  "payment_method": "razorpay",
  "amount": 1500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment": {
    "id": 1,
    "booking_id": 2,
    "user_id": 1,
    "transaction_id": "txn_1234567890",
    "payment_gateway": "razorpay",
    "amount": 1500,
    "currency": "INR",
    "status": "completed",
    "payment_method": "razorpay",
    "payment_date": "2025-01-15T00:00:00.000Z"
  }
}
```

### Wallet Management

#### Get Wallet Transactions
```
GET /wallet/transactions
```

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "transaction_type": "credit",
      "amount": 100,
      "balance_before": 0,
      "balance_after": 100,
      "description": "Referral bonus",
      "reference_type": "referral",
      "reference_id": null,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Recharge Wallet
```
POST /wallet/recharge
```

**Request Body:**
```json
{
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet recharged successfully",
  "transaction": {
    "id": 2,
    "user_id": 1,
    "transaction_type": "credit",
    "amount": 500,
    "balance_before": 100,
    "balance_after": 600,
    "description": "Wallet recharge",
    "reference_type": "admin_credit",
    "reference_id": null,
    "created_at": "2025-01-15T00:00:00.000Z"
  },
  "new_balance": 600
}
```

### Admin Endpoints

#### Get Dashboard Stats
```
GET /admin/dashboard
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_members": 45,
    "active_members": 32,
    "total_seats": 50,
    "occupied_seats": 28,
    "available_seats": 22,
    "todays_revenue": 15000,
    "total_revenue": 450000
  }
}
```

#### Get All Members
```
GET /admin/members
```

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "1234567890",
      "is_blocked": false,
      "is_verified": true,
      "wallet_balance": 600,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Block/Unblock User
```
PUT /admin/members/:id/block
```

**Request Body:**
```json
{
  "is_blocked": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

#### Get All Payments
```
GET /payments
```

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "booking_id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "transaction_id": "txn_1234567890",
      "payment_gateway": "razorpay",
      "amount": 1500,
      "currency": "INR",
      "status": "completed",
      "payment_method": "razorpay",
      "payment_date": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Process Refund
```
POST /payments/:id/refund
```

**Request Body:**
```json
{
  "refund_amount": 1500,
  "refund_method": "wallet",
  "refund_reason": "Booking cancellation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    "id": 1,
    "payment_id": 1,
    "booking_id": 1,
    "user_id": 1,
    "refund_amount": 1500,
    "refund_type": "full",
    "refund_method": "wallet",
    "refund_reason": "Booking cancellation",
    "refund_status": "completed",
    "processed_by": 1,
    "refund_date": "2025-01-15T00:00:00.000Z"
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per hour per IP for unauthenticated endpoints
- 500 requests per hour per IP for authenticated endpoints

## CORS Policy

The API allows CORS requests from the frontend origin specified in the `CLIENT_URL` environment variable.

## Security

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation is performed on all endpoints
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding

## Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Unexpected server error
- `503`: Service Unavailable - Temporary server issue

## Versioning

The API is currently at version 1.0. Breaking changes will be introduced in new major versions.

## Support

For API-related questions or issues, please contact support@smartlibrary.com or create an issue on GitHub.