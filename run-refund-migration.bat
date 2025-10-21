@echo off
echo ========================================
echo User Refund Request Migration
echo ========================================
echo.
echo Running database migration...
echo.

type database\user_refund_requests.sql | C:\xampp\mysql\bin\mysql.exe -u root sml_library

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo Tables created:
    echo - user_refund_requests
    echo.
    echo Trigger created:
    echo - after_refund_request_insert
    echo.
) else (
    echo.
    echo ========================================
    echo Migration FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
