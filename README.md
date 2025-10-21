# Smart Library - Online Library Seat Booking System

A comprehensive library seat booking system with user and admin panels, featuring Progressive Web App (PWA) support for offline mobile use.

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-brightgreen)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-blue)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### User Side
- User registration and authentication
- Seat browsing and selection (S01-S50)
- Plan selection and booking
- Wallet system with recharge functionality
- Payment integration framework
- Advance booking system
- Facilities information
- Support ticket system
- Profile management
- Dark/Light mode toggle
- Mobile-responsive design
- **Progressive Web App (PWA) support for offline mobile use**

### Admin Side
- Dashboard with analytics and metrics
- Members management
- Seat management (CRUD operations)
- Plan management (CRUD operations)
- Payment tracking and management
- Facilities management
- Banner and notice management
- Coupon code generator
- Notification system
- Reports and analytics
- Expense records
- Payment gateway settings
- Refund management
- User impersonation
- Audit logs

## 🛠️ Tech Stack

- **Frontend**: React.js, CSS3, HTML5
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **Payment Integration**: Razorpay, Stripe, PayPal, PhonePe, Google Pay, Paytm (configurable)
- **Deployment**: Heroku, VPS, or any Node.js hosting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Git (for version control)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sml-library-booking.git
cd sml-library-booking
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Database Setup

1. Create a MySQL database:
   ```sql
   CREATE DATABASE sml_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Import the database schema:
   ```bash
   # If you have MySQL command line tools
   mysql -u root -p sml_library < database/schema.sql
   
   # For additional features (refunds, audit logs, etc.)
   mysql -u root -p sml_library < database/advanced_features.sql
   ```

### 4. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=sml_library

   # JWT Secret (generate a random string)
   JWT_SECRET=your_secret_key_min_32_characters_long
   JWT_EXPIRE=30d

   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Payment Gateway - Add your keys for each gateway you want to use
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

### 5. Create Upload Directories

```bash
# Run the setup script
./setup.bat

# Or manually create directories
mkdir uploads
mkdir uploads/profiles
mkdir uploads/banners
mkdir uploads/facilities
mkdir uploads/others
```

### 6. Create Admin Account

1. Generate a hashed password:
   ```bash
   node scripts/generate-admin-password.js
   ```

2. Copy the hashed password and insert the admin user into your database:
   ```sql
   INSERT INTO admins (name, email, password, role) VALUES 
   ('Super Admin', 'admin@smartlibrary.com', 'YOUR_HASHED_PASSWORD_HERE', 'super_admin');
   ```

## ▶️ Running the Application

### Development Mode

```bash
# Run both backend and frontend
npm run dev:full
```

This will start both the server and client in development mode.

### Production Mode

1. Build the frontend:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. Start the server:
   ```bash
   npm start
   ```

## 🌐 Access the Application

- **User Interface**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin/login`
- **Default Admin Credentials**:
  - Email: `admin@smartlibrary.com`
  - Password: `admin123` (or whatever you set)

## 📱 Mobile App Version (PWA)

This application includes a Progressive Web App (PWA) version that can be installed on mobile devices for offline use.

### To Use the Mobile App:

1. Start the application in production mode
2. On your mobile device, connected to the same network, open your browser and go to:
   ```
   http://YOUR_COMPUTER_IP_ADDRESS:5000
   ```
3. Install the app on your mobile device:
   - Look for "Add to Home Screen" or "Install App" option in your mobile browser
   - This allows you to use it like a native app, even offline

## 🚢 Deployment Options

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon (or use external database)
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key_min_32_characters_long

# Deploy
git push heroku main
```

### Deploy to VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server

# Clone project
git clone https://github.com/your-username/sml-library-booking.git
cd sml-library-booking

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name sml-library

# Setup Nginx reverse proxy (optional but recommended)
sudo apt install nginx
```

## 🎨 Customization

### Change Colors

Edit `client/src/index.css`:

```css
:root {
  --primary-color: #EF476F;  /* Change to your brand color */
  --secondary-color: #06D6A0;
  --accent-color: #118AB2;
}
```

### Add More Seats

Run SQL:

```sql
INSERT INTO seats (seat_number, seat_status, floor) VALUES
('S51', 'available', 4),
('S52', 'available', 4);
-- Add as many as needed
```

### Configure Payment Gateways

1. Go to Admin Panel → Settings → Payment Gateway
2. Add your API keys for:
   - Razorpay
   - Stripe
   - PayPal
   - PhonePe
   - Google Pay
   - Paytm

## 🐛 Troubleshooting

### Database Connection Error

```
❌ Database connection failed
```

**Solution:**
1. Check MySQL is running
2. Verify credentials in `.env` file
3. Ensure database `sml_library` exists

### Port Already in Use

```
Error: Port 5000 is already in use
```

**Solution:**
Change port in `.env`:
```env
PORT=5001
```

### React App Won't Start

```
Error: Cannot find module 'react'
```

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Endpoints

### Authentication
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/admin/login` - Admin login
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- POST `/api/auth/change-password` - Change password

### User
- GET `/api/user/profile` - Get user profile
- PUT `/api/user/profile` - Update profile
- GET `/api/user/notifications` - Get notifications

### Plans
- GET `/api/plans` - Get all plans
- GET `/api/plans/:id` - Get single plan
- POST `/api/plans` (Admin) - Create plan
- PUT `/api/plans/:id` (Admin) - Update plan
- DELETE `/api/plans/:id` (Admin) - Delete plan

### Seats
- GET `/api/seats` - Get available seats
- POST `/api/seats` (Admin) - Create seat
- PUT `/api/seats/:id` (Admin) - Update seat
- DELETE `/api/seats/:id` (Admin) - Delete seat

### Bookings
- GET `/api/bookings` - Get user bookings
- POST `/api/bookings` - Create new booking

### Payments
- POST `/api/payments/process` - Process payment
- GET `/api/payments` (Admin) - Get all payments
- POST `/api/payments/:id/refund` (Admin) - Process refund

### Admin
- GET `/api/admin/dashboard` - Get dashboard stats
- GET `/api/admin/members` - Get all members
- PUT `/api/admin/members/:id/block` - Block/Unblock user

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@smartlibrary.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with:
- React.js
- Node.js & Express
- MySQL
- Modern CSS3

**Happy Coding! 🚀**