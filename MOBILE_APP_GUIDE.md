# Mobile App Version of Library Booking System

## How to Use This Mobile App

This is a Progressive Web App (PWA) version of your library booking system that can be installed and used on your mobile device without requiring external hosting.

## Setup Instructions

1. **Start the PWA Server:**
   - Double-click on `start-pwa.bat` file
   - Or run `npm run serve-pwa` from the command line in this directory
   - The server will start on port 3000

2. **Find Your Computer's IP Address:**
   - Open Command Prompt and type `ipconfig`
   - Look for "IPv4 Address" under your active network connection
   - Note this IP address (e.g., 192.168.1.100)

3. **Access on Mobile Device:**
   - Make sure your mobile device is connected to the same Wi-Fi network as your computer
   - Open your mobile browser and go to: `http://YOUR_IP_ADDRESS:3000`
   - Replace YOUR_IP_ADDRESS with your computer's IP address

4. **Install as App:**
   - In your mobile browser, look for the "Add to Home Screen" or "Install App" option
   - This varies by browser:
     - **Chrome**: Tap the three dots menu → "Add to Home screen"
     - **Safari**: Tap the share button → "Add to Home Screen"
   - Once installed, you can use it like a native app, even offline

## Features

- Works offline after initial load
- Can be installed on your mobile device
- No internet required after initial download
- App-like experience with home screen icon
- Fast loading times due to caching

## Troubleshooting

- If the app doesn't load, make sure:
  1. Both devices are on the same Wi-Fi network
  2. Windows Firewall isn't blocking port 3000
  3. The server is running on your computer

- To stop the server, close the command prompt window or press Ctrl+C