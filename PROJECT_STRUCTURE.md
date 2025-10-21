# Project Structure Documentation

This document provides a comprehensive overview of the Smart Library Booking System project structure.

## Root Directory

```
sml-library-booking/
├── client/                 # React frontend application
├── server/                 # Node.js backend (controllers, routes, etc.)
├── database/               # Database schema and migration files
├── scripts/                # Utility scripts
├── uploads/                # (gitignored) User uploaded files
├── .env                    # (gitignored) Environment variables
├── .env.example            # Example environment file
├── .gitignore              # Git ignore file
├── package.json            # Root package.json (backend dependencies)
├── server.js               # Main server entry point
├── setup.bat               # Windows setup script
├── setup.sh                # Unix setup script
├── README.md               # Main project documentation
├── SETUP_GUIDE.md          # Detailed setup instructions
├── GITHUB_DEPLOYMENT_GUIDE.md # GitHub deployment guide
├── PROJECT_STRUCTURE.md    # This file
└── LICENSE                 # License file
```

## Client Directory (Frontend)

```
client/
├── public/                 # Static files
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Service worker for PWA
│   └── favicon.ico         # Favicon
├── src/                    # React source code
│   ├── components/         # Reusable components
│   │   ├── common/         # Common UI components (Button, Card, etc.)
│   │   ├── layouts/        # Layout components (AdminLayout, UserLayout)
│   │   └── navigation/     # Navigation components (Sidebar, BottomNav)
│   ├── context/            # React context providers
│   │   ├── AuthContext.js  # Authentication context
│   │   └── ThemeContext.js # Theme context (dark/light mode)
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin panel pages
│   │   └── user/           # User-facing pages
│   ├── services/           # Service files (API calls)
│   │   └── api.js          # API service
│   ├── App.js              # Main App component
│   ├── index.css           # Global CSS styles
│   ├── index.js            # React entry point
│   └── serviceWorkerRegistration.js # PWA service worker registration
├── package.json            # Frontend dependencies
└── webpack.config.js       # Webpack configuration (for PWA)
```

## Server Directory (Backend)

```
server/
├── config/                 # Configuration files
│   └── database.js         # Database connection
├── controllers/            # Request handlers
│   └── authController.js   # Authentication controller
├── middleware/             # Express middleware
│   ├── auth.js             # Authentication middleware
│   ├── upload.js           # File upload middleware
│   └── validator.js        # Validation middleware
├── routes/                 # API routes
│   ├── adminRoutes.js      # Admin routes
│   ├── authRoutes.js       # Authentication routes
│   ├── userRoutes.js       # User routes
│   ├── seatRoutes.js       # Seat management routes
│   ├── planRoutes.js       # Plan management routes
│   ├── bookingRoutes.js    # Booking routes
│   ├── paymentRoutes.js    # Payment routes
│   ├── facilityRoutes.js   # Facility routes
│   ├── notificationRoutes.js # Notification routes
│   ├── couponRoutes.js     # Coupon routes
│   ├── walletRoutes.js     # Wallet routes
│   ├── supportRoutes.js    # Support ticket routes
│   ├── bannerRoutes.js     # Banner routes
│   ├── noticeRoutes.js     # Notice routes
│   ├── reportRoutes.js     # Report routes
│   ├── expenseRoutes.js    # Expense routes
│   ├── gatewayRoutes.js    # Payment gateway routes
│   ├── offerRoutes.js      # Offer routes
│   ├── advanceBookingRoutes.js # Advance booking routes
│   ├── galleryRoutes.js    # Gallery routes
│   ├── adminNotificationRoutes.js # Admin notification routes
│   ├── refundRoutes.js     # Refund routes
│   ├── adminUserControlRoutes.js # Admin user control routes
│   ├── impersonationRoutes.js # User impersonation routes
│   ├── auditRoutes.js      # Audit log routes
│   └── userRefundRequestRoutes.js # User refund request routes
├── services/               # Business logic services
│   └── notificationScheduler.js # Notification scheduler
└── utils/                  # Utility functions
    ├── adminNotificationService.js # Admin notification service
    ├── helpers.js          # Helper functions
    └── notificationService.js # Notification service
```

## Database Directory

```
database/
├── schema.sql              # Main database schema
├── advanced_features.sql   # Advanced features schema (refunds, audit logs)
├── additional_tables.sql   # Additional tables
├── admin_notifications_table.sql # Admin notifications table
├── gallery_table.sql       # Gallery table
├── user_refund_requests.sql # User refund requests table
└── fix_user_refund_requests.sql # Fix for user refund requests
```

## Scripts Directory

```
scripts/
└── generate-admin-password.js # Script to generate admin password hash
```

## Key Files Explanation

### Root Files
- **server.js**: Main entry point for the Node.js application
- **package.json**: Defines project dependencies and scripts
- **.env.example**: Template for environment variables
- **setup.bat/sh**: Scripts to create necessary directories

### Client Files
- **client/src/App.js**: Main React application component
- **client/src/index.js**: React DOM rendering entry point
- **client/src/context/AuthContext.js**: Authentication state management
- **client/src/services/api.js**: API client configuration

### Server Files
- **server/config/database.js**: Database connection pool configuration
- **server/middleware/auth.js**: JWT authentication middleware
- **server/controllers/authController.js**: Authentication logic
- **server/routes/authRoutes.js**: Authentication API endpoints

### Database Files
- **database/schema.sql**: Complete database schema with all tables
- **database/advanced_features.sql**: Additional tables for advanced features

## Environment Variables

The application uses the following environment variables (defined in `.env`):

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sml_library

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Payment Gateway - Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Payment Gateway - PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Payment Gateway - PhonePe
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## API Structure

The backend API is organized into the following route groups:

1. **Authentication**: `/api/auth/*`
2. **User Management**: `/api/user/*`
3. **Admin Management**: `/api/admin/*`
4. **Seat Management**: `/api/seats/*`
5. **Plan Management**: `/api/plans/*`
6. **Booking Management**: `/api/bookings/*`
7. **Payment Processing**: `/api/payments/*`
8. **Facility Management**: `/api/facilities/*`
9. **Notifications**: `/api/notifications/*`
10. **Coupons**: `/api/coupons/*`
11. **Wallet**: `/api/wallet/*`
12. **Support**: `/api/support/*`
13. **Banners**: `/api/banners/*`
14. **Notices**: `/api/notices/*`
15. **Reports**: `/api/admin/reports/*`
16. **Expenses**: `/api/admin/expenses/*`
17. **Payment Gateway Settings**: `/api/admin/gateway-settings/*`
18. **Offers**: `/api/offers/*`
19. **Advance Bookings**: `/api/advance-bookings/*`
20. **Gallery**: `/api/gallery/*`
21. **Admin Notifications**: `/api/admin/admin-notifications/*`
22. **Refunds**: `/api/admin/refunds/*`
23. **Admin User Control**: `/api/admin/user-control/*`
24. **Impersonation**: `/api/admin/impersonation/*`
25. **Audit Logs**: `/api/admin/audit-logs/*`
26. **User Refund Requests**: `/api/user-refund-requests/*`

## Database Schema Overview

The database contains the following main tables:

1. **users**: User accounts and profiles
2. **admins**: Admin accounts
3. **password_reset_tokens**: Password reset tokens
4. **plans**: Subscription plans
5. **seats**: Library seats
6. **bookings**: Seat bookings
7. **payments**: Payment records
8. **coupons**: Discount coupons
9. **coupon_usage**: Coupon usage tracking
10. **wallet_transactions**: Wallet transaction history
11. **facilities**: Library facilities
12. **banners**: Homepage banners
13. **notices**: Library notices
14. **notifications**: User notifications
15. **support_tickets**: Support tickets
16. **support_messages**: Support ticket messages
17. **payment_gateway_settings**: Payment gateway configurations
18. **system_settings**: System-wide settings
19. **expense_records**: Expense tracking
20. **refunds**: Refund records (advanced features)
21. **admin_action_logs**: Admin action audit trail (advanced features)
22. **admin_user_sessions**: Admin user impersonation sessions (advanced features)
23. **booking_modifications**: Booking modification logs (advanced features)
24. **auto_refund_rules**: Automatic refund rules (advanced features)

## Frontend Page Structure

### User Pages
- **Home**: Main dashboard with banners and quick actions
- **Login/Signup**: Authentication pages
- **Forgot Password**: Password reset flow
- **Plans**: Plan selection and details
- **Check Seats**: Real-time seat availability
- **Seat Selection**: Interactive seat selection
- **Checkout**: Booking confirmation and payment
- **My Bookings**: User's booking history
- **Wallet**: Wallet balance and transactions
- **Facilities**: Library facilities information
- **Notifications**: User notifications
- **Profile**: User profile management
- **Support**: Support ticket system
- **Offers**: Special offers and promotions

### Admin Pages
- **Dashboard**: Analytics and overview
- **Members**: User management
- **Seats**: Seat management
- **Plans**: Plan management
- **Facilities**: Facility management
- **Payments**: Payment tracking
- **Banners**: Banner management
- **Notices**: Notice board management
- **Coupons**: Coupon management
- **Notifications**: Notification management
- **Reports**: Analytics and reports
- **Expenses**: Expense tracking
- **Gateway Settings**: Payment gateway configuration
- **Refund Management**: Refund processing
- **User Refund Requests**: User refund requests
- **Audit Logs**: Admin action logs
- **Admin Notifications**: Admin-specific notifications

This structure provides a clear separation of concerns between frontend and backend, with organized routing and modular components.