# SML - Smart Library Booking System
## Complete Setup & Deployment Guide

---

## 🚀 **QUICK START GUIDE**

### **Prerequisites**
Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## 📦 **STEP 1: INSTALLATION**

### **1.1 Clone the Repository**

If you haven't already, clone the repository:

```bash
git clone https://github.com/your-username/sml-library-booking.git
cd sml-library-booking
```

### **1.2 Install Backend Dependencies**

Open terminal in the project root directory and run:

```bash
npm install
```

### **1.3 Install Frontend Dependencies**

Navigate to the client folder and install:

```bash
cd client
npm install
cd ..
```

---

## 🗄️ **STEP 2: DATABASE SETUP**

### **2.1 Create MySQL Database**

1. Open MySQL Command Line or MySQL Workbench
2. Run the following commands:

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE sml_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE sml_library;

-- Import the schema
SOURCE database/schema.sql;

-- For advanced features (refunds, audit logs, etc.)
SOURCE database/advanced_features.sql;
```

**OR** manually import:
- Open `database/schema.sql` in MySQL Workbench
- Execute the entire file
- Repeat with `database/advanced_features.sql`

### **2.2 Create Default Admin Account**

You need to hash the password first. Run this Node.js script:

```bash
node scripts/generate-admin-password.js
```

Then insert the admin into MySQL using the output from the script:

```sql
INSERT INTO admins (name, email, password, role) VALUES 
('Super Admin', 'admin@smartlibrary.com', 'YOUR_HASHED_PASSWORD_HERE', 'super_admin');
```

---

## ⚙️ **STEP 3: ENVIRONMENT CONFIGURATION**

### **3.1 Create Environment File**

Copy the example file:

```bash
# On Windows
copy .env.example .env

# On macOS/Linux
cp .env.example .env
```

### **3.2 Edit .env File**

Open `.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sml_library

# JWT Secret (Generate a random string)
JWT_SECRET=your_secret_key_min_32_characters_long
JWT_EXPIRE=30d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

---

## 📁 **STEP 4: CREATE UPLOAD DIRECTORIES**

Run the setup script:

```bash
# On Windows
setup.bat

# On macOS/Linux
./setup.sh
```

**OR** manually create folders:

```bash
mkdir uploads
mkdir uploads/profiles
mkdir uploads/banners
mkdir uploads/facilities
mkdir uploads/others
```

---

## 🏃 **STEP 5: RUN THE APPLICATION**

### **Option 1: Run Both Backend & Frontend Together**

```bash
npm run dev:full
```

### **Option 2: Run Separately**

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

---

## 🌐 **STEP 6: ACCESS THE APPLICATION**

### **User Interface:**
- URL: `http://localhost:3000`
- Features:
  - Sign Up / Login
  - Browse Plans
  - Book Seats
  - View Facilities
  - Check Wallet
  - Support System

### **Admin Panel:**
- URL: `http://localhost:3000/admin/login`
- Default Credentials:
  - Email: `admin@smartlibrary.com`
  - Password: `admin123` (or whatever you set)

---

## 🎨 **FEATURES IMPLEMENTED**

### ✅ **User Side**
- [x] Responsive Mobile-First Design
- [x] User Authentication (Sign Up, Login, Password Reset)
- [x] Home Dashboard with Banner Carousel
- [x] Plans Listing
- [x] Seat Selection (S01-S50)
- [x] Advance Booking
- [x] Payment Integration Framework
- [x] Wallet System
- [x] Facilities Page
- [x] Support & Tickets
- [x] Profile Management
- [x] Dark/Light Mode Toggle
- [x] Progressive Web App (PWA) Support

### ✅ **Admin Side**
- [x] Admin Dashboard with Clickable Metrics
- [x] Side Navigation Menu
- [x] Members Management
- [x] Seat Management (CRUD)
- [x] Plan Management (CRUD)
- [x] Payment Tracking
- [x] Facilities Management
- [x] Banner Management
- [x] Notice Board Management
- [x] Coupon Code Generator
- [x] Notification System
- [x] Reports & Analytics
- [x] Expense Records
- [x] Payment Gateway Settings
- [x] Refund Management
- [x] User Impersonation
- [x] Audit Logs

---

## 🔧 **CUSTOMIZATION**

### **Change Colors**

Edit `client/src/index.css`:

```css
:root {
  --primary-color: #EF476F;  /* Change to your brand color */
  --secondary-color: #06D6A0;
  --accent-color: #118AB2;
}
```

### **Add More Seats**

Run SQL:

```sql
INSERT INTO seats (seat_number, seat_status, floor) VALUES
('S51', 'available', 4),
('S52', 'available', 4);
-- Add as many as needed
```

### **Configure Payment Gateways**

1. Go to Admin Panel → Settings → Payment Gateway
2. Add your API keys for:
   - Razorpay
   - Stripe
   - PayPal
   - PhonePe
   - Google Pay
   - Paytm

---

## 🚢 **DEPLOYMENT**

See our detailed [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### **Production Build**

```bash
# Build frontend
cd client
npm run build
cd ..

# Set NODE_ENV in .env file:
NODE_ENV=production

# Start server
npm start
```

### **Deploy to Heroku**

```bash
# Login to Heroku
heroku login

# Create app
heroku create sml-library

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### **Deploy to VPS (Ubuntu)**

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

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start server.js --name sml-library

# Setup Nginx reverse proxy
sudo apt install nginx
```

---

## 🐛 **TROUBLESHOOTING**

### **Database Connection Error**

```
❌ Database connection failed
```

**Solution:**
1. Check MySQL is running: `mysql -V`
2. Verify credentials in `.env` file
3. Ensure database `sml_library` exists

### **Port Already in Use**

```
Error: Port 5000 is already in use
```

**Solution:**
Change port in `.env`:
```env
PORT=5001
```

### **React App Won't Start**

```
Error: Cannot find module 'react'
```

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 **API ENDPOINTS**

### **Authentication**
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/admin/login` - Admin login
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- POST `/api/auth/change-password` - Change password

### **User**
- GET `/api/user/profile` - Get user profile
- PUT `/api/user/profile` - Update profile
- GET `/api/user/notifications` - Get notifications

### **Plans**
- GET `/api/plans` - Get all plans
- GET `/api/plans/:id` - Get single plan
- POST `/api/plans` (Admin) - Create plan
- PUT `/api/plans/:id` (Admin) - Update plan
- DELETE `/api/plans/:id` (Admin) - Delete plan

### **Seats**
- GET `/api/seats` - Get available seats
- POST `/api/seats` (Admin) - Create seat
- PUT `/api/seats/:id` (Admin) - Update seat
- DELETE `/api/seats/:id` (Admin) - Delete seat

### **Bookings**
- GET `/api/bookings` - Get user bookings
- POST `/api/bookings` - Create new booking

### **Payments**
- POST `/api/payments/process` - Process payment
- GET `/api/payments` (Admin) - Get all payments
- POST `/api/payments/:id/refund` (Admin) - Process refund

### **Admin**
- GET `/api/admin/dashboard` - Get dashboard stats
- GET `/api/admin/members` - Get all members
- PUT `/api/admin/members/:id/block` - Block/Unblock user

---

## 📞 **SUPPORT & DOCUMENTATION**

For detailed API documentation, refer to the Postman collection (coming soon).

For issues or questions:
- Create an issue on GitHub
- Email: support@smartlibrary.com
- Documentation: [Wiki](./docs)

---

## 🎯 **NEXT STEPS**

1. **Implement Payment Gateway Integration**
   - Integrate Razorpay SDK
   - Add Stripe payments
   - Configure webhooks

2. **Complete Remaining Pages**
   - Build out all placeholder pages
   - Add data tables for management pages
   - Implement filters and search

3. **Add More Features**
   - Email notifications
   - SMS alerts
   - PDF invoice generation
   - Excel reports export
   - QR code for bookings

4. **Testing**
   - Write unit tests
   - Integration tests
   - End-to-end tests

5. **Optimization**
   - Add caching (Redis)
   - Optimize database queries
   - Implement CDN for assets
   - Add service workers for PWA

---

## 📄 **LICENSE**

MIT License - See LICENSE file for details

---

## 🙏 **CREDITS**

Built with:
- React.js
- Node.js & Express
- MySQL
- Modern CSS3

---

**Happy Coding! 🚀**