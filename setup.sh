#!/bin/bash

echo "Creating directory structure..."

# Create uploads directory and subdirectories
mkdir -p uploads/profiles
mkdir -p uploads/banners
mkdir -p uploads/facilities
mkdir -p uploads/others

echo ""
echo "Directory structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Install dependencies: npm install"
echo "3. Setup MySQL database using database/schema.sql"
echo "4. Start the server: npm run dev"
echo ""