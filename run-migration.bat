@echo off
echo ============================================
echo Running Advanced Features Database Migration
echo ============================================
echo.

REM Check if MySQL is running
echo Checking MySQL service...
sc query MySQL 2>nul | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL service is not running!
    echo Please start MySQL from XAMPP Control Panel
    pause
    exit /b 1
)

echo MySQL is running...
echo.

REM Set MySQL path (adjust if needed)
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

REM Check if MySQL executable exists
if not exist "%MYSQL_PATH%" (
    echo ERROR: MySQL not found at %MYSQL_PATH%
    echo Please update the MYSQL_PATH in this script
    pause
    exit /b 1
)

echo Importing advanced_features.sql...
echo.

REM Run the migration
"%MYSQL_PATH%" -u root sml_library < database\advanced_features.sql

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo SUCCESS! Migration completed successfully!
    echo ============================================
    echo.
    echo The following tables have been created:
    echo - refunds
    echo - admin_action_logs
    echo - admin_user_sessions
    echo - booking_modifications
    echo - auto_refund_rules
    echo.
    echo You can now use:
    echo - Refund Management
    echo - Admin User Control
    echo - Login as User
    echo - Audit Logs
    echo.
) else (
    echo.
    echo ============================================
    echo ERROR! Migration failed!
    echo ============================================
    echo.
    echo Please check:
    echo 1. MySQL is running in XAMPP
    echo 2. Database 'sml_library' exists
    echo 3. MySQL root user has no password or update the command
    echo.
)

pause
