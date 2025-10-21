@echo off
echo Creating directory structure...

mkdir uploads 2>nul
mkdir uploads\profiles 2>nul
mkdir uploads\banners 2>nul
mkdir uploads\facilities 2>nul
mkdir uploads\others 2>nul

echo.
echo Directory structure created successfully!
echo.
echo Next steps:
echo 1. Copy .env.example to .env and configure your settings
echo 2. Install dependencies: npm install
echo 3. Setup MySQL database using database\schema.sql
echo 4. Start the server: npm run dev
echo.
pause
