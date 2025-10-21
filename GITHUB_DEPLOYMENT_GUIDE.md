# GitHub Deployment Guide for Smart Library Booking System

This guide will help you properly set up and deploy the Smart Library Booking System on GitHub and hosting platforms.

## 📁 Repository Structure

Ensure your repository has the following structure:

```
sml-library-booking/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/                 # Node.js backend routes/controllers
├── database/               # SQL schema and migration files
├── scripts/                # Utility scripts
├── uploads/                # (gitignored) User uploads
├── .env                    # (gitignored) Environment variables
├── .env.example            # Example environment file
├── .gitignore              # Git ignore file
├── package.json            # Root package.json
├── server.js               # Main server file
├── README.md               # Project documentation
├── LICENSE                 # License file
└── ...                     # Other configuration files
```

## 🔧 Preparing for GitHub

### 1. Environment Files

Never commit your `.env` file to GitHub as it contains sensitive information. Instead:

1. Ensure `.env` is in your `.gitignore` file
2. Keep `.env.example` updated with all required environment variables:

```env
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

# Email Configuration (for password reset)
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

### 2. Uploads Directory

The `uploads/` directory should never be committed to GitHub as it contains user-generated content. Ensure it's in your `.gitignore` file.

Instead, provide clear instructions in your README for creating this directory during setup.

## 🚀 Deployment Options

### Option 1: Heroku Deployment

Heroku is a popular platform for deploying Node.js applications.

#### Automatic Deployment from GitHub

1. Connect your GitHub repository to Heroku:
   - Go to your Heroku dashboard
   - Create a new app or select an existing one
   - In the "Deploy" tab, connect to GitHub
   - Search for your repository and connect it
   - Enable "Automatic deploys" from your preferred branch

2. Configure environment variables:
   - Go to the "Settings" tab
   - Click "Reveal Config Vars"
   - Add all your environment variables from `.env`:
     ```
     NODE_ENV = production
     DB_HOST = your_database_host
     DB_USER = your_database_user
     DB_PASSWORD = your_database_password
     DB_NAME = sml_library
     JWT_SECRET = your_jwt_secret_key
     ...
     ```

3. Add MySQL database:
   - In the "Resources" tab, search for "JawsDB MySQL"
   - Provision a free tier database
   - Heroku will automatically add database connection variables

4. Configure buildpacks:
   - Go to the "Settings" tab
   - In "Buildpacks", add:
     1. `heroku/nodejs` (primary)
   
5. Deploy:
   - Either push to your GitHub repository (for automatic deployment)
   - Or manually deploy from the Heroku dashboard

#### Manual Deployment using Heroku CLI

1. Install Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_key
   # Add all other required environment variables
   ```

5. Add MySQL database:
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

6. Deploy:
   ```bash
   git push heroku main
   ```

### Option 2: Render Deployment

Render is another great platform for hosting full-stack applications.

1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure settings:
   - Name: Your app name
   - Environment: Node
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Add environment variables in the "Advanced" section
6. Add a MySQL database through Render's dashboard
7. Deploy!

### Option 3: Vercel + External Backend

For a more complex setup, you can deploy the frontend to Vercel and the backend separately.

#### Frontend (Vercel):
1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the root directory to `/client`
4. Add environment variables as needed
5. Deploy

#### Backend (Separate hosting):
Deploy your backend to a Node.js hosting service like:
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

## 🛠️ Database Migration

When deploying to production, you'll need to set up your database:

### 1. Create Database
Run the following SQL commands or import the schema files:

```sql
CREATE DATABASE sml_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sml_library;

-- Import schema.sql
SOURCE database/schema.sql;

-- For advanced features (refunds, audit logs, etc.)
SOURCE database/advanced_features.sql;
```

### 2. Create Admin User
Generate a hashed password and create the admin user:

```bash
# Generate hashed password
node scripts/generate-admin-password.js

# Use the output to create your admin user in the database
```

## 🔐 Security Considerations

1. **Never commit sensitive information**:
   - API keys
   - Database credentials
   - JWT secrets
   - Passwords

2. **Use environment variables** for all sensitive data

3. **Regularly rotate secrets** and API keys

4. **Use HTTPS** in production

5. **Implement proper authentication and authorization**

## 🔄 CI/CD with GitHub Actions

You can set up automated testing and deployment with GitHub Actions:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-heroku-app-name"
        heroku_email: "your-email@example.com"
```

## 📊 Monitoring and Logging

Consider adding monitoring to your deployed application:

1. **Error Tracking**: Sentry, Rollbar
2. **Performance Monitoring**: New Relic, DataDog
3. **Logging**: Papertrail, Loggly
4. **Uptime Monitoring**: UptimeRobot, Pingdom

## 🆘 Troubleshooting Common Issues

### Build Failures
- Check that all dependencies are properly listed in package.json
- Ensure Node.js version compatibility
- Verify build scripts in package.json

### Database Connection Issues
- Verify database credentials in environment variables
- Check that the database is accessible from your hosting platform
- Ensure proper firewall settings

### Environment Variables Not Loading
- Check that variables are properly set in your hosting platform
- Verify that your code correctly loads environment variables
- Ensure no typos in variable names

### CORS Errors
- Check that your CLIENT_URL environment variable is set correctly
- Verify CORS configuration in your server code

## 🎉 Success!

Once deployed, your application should be accessible at your hosting platform's provided URL. Make sure to:

1. Test all functionality
2. Verify database connections
3. Confirm payment integrations work
4. Test user registration and login
5. Verify admin panel access
6. Check mobile responsiveness
7. Test PWA functionality

Remember to update your README.md with the live URLs once deployment is complete!