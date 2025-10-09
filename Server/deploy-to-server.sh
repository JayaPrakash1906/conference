#!/bin/bash

# Deployment script for auto-confirmation fix
# Run this on your server after uploading the files

echo "🚀 Starting deployment of auto-confirmation fix..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the Server directory."
    exit 1
fi

echo "📦 Installing dependencies (if needed)..."
npm install

echo "🗃️  Running database fix..."
node quick-fix.js

if [ $? -eq 0 ]; then
    echo "✅ Database fix completed successfully!"
else
    echo "❌ Database fix failed. Please check the error above."
    exit 1
fi

echo "🔄 Restarting server..."

# Check if PM2 is being used
if command -v pm2 &> /dev/null; then
    echo "Using PM2 to restart server..."
    pm2 restart all
    pm2 status
else
    echo "PM2 not found. Please restart your server manually:"
    echo "1. Stop current server (Ctrl+C or kill process)"
    echo "2. Run: npm start"
fi

echo "🎉 Deployment completed!"
echo "✅ Admin bookings should now auto-confirm!"
echo "🧪 Test by creating a new booking in the admin panel."
