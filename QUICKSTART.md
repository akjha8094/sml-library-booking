# 🚀 QUICK START - SML Library Booking System

## ⚡ 3-Step Setup

### Step 1: Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### Step 2: Setup Database
```bash
# Create database in MySQL
mysql -u root -p
CREATE DATABASE sml_library;
USE sml_library;
SOURCE database/schema.sql;
QUIT;
```

### Step 3: Configure & Run
```bash
# Create .env file
copy .env.example .env

# Edit .env with your MySQL password:
# DB_PASSWORD=your_mysql_password

# Generate admin password
node scripts/generate-admin-password.js

# Run the application
npm run dev:full
```

## 🌐 Access Points

- **User App:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login
- **API Server:** http://localhost:5000

## 🔑 Default Credentials

**Admin Login:**
- Email: `admin@smartlibrary.com`
- Password: `admin123` (or your custom password)

## 📂 Important Files

- `SETUP_GUIDE.md` - Complete setup instructions
- `PROJECT_SUMMARY.md` - What's built and what's next
- `README.md` - Project overview
- `.env.example` - Environment configuration template

## 🎯 What Works Now

✅ User signup and login  
✅ Admin dashboard with clickable metrics  
✅ Home page with banners  
✅ Dark/Light mode  
✅ Responsive design  
✅ Complete backend API  
✅ MySQL database with 20+ tables  

## 📝 What To Build Next

📌 Plans listing page  
📌 Seat selection (S01-S50)  
📌 Booking checkout  
📌 Admin management pages (data tables)  
📌 Payment gateway integration  
📌 Reports and analytics  

## 🆘 Quick Troubleshooting

**Database Error?**
→ Check MySQL is running and credentials in .env are correct

**Port 5000 in use?**
→ Change PORT=5001 in .env file

**React not starting?**
→ cd client && rm -rf node_modules && npm install

## 📚 Documentation

- **Setup Guide:** See `SETUP_GUIDE.md` for detailed instructions
- **API Docs:** All endpoints listed in `PROJECT_SUMMARY.md`
- **Database Schema:** Check `database/schema.sql`

---

**Ready to code! 🎉**

Need help? Check the full guides or reach out!
