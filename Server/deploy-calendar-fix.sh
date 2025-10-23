#!/bin/bash

echo "🗃️  Deploying auto-confirmation fix for calendar database..."

# Check if we're in the Server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this from the Server directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗃️  Running calendar database fix..."
node fix-calendar-db.js

if [ $? -eq 0 ]; then
    echo "✅ Database fix completed successfully!"
    
    echo "🔄 Restarting server..."
    
    # Try to restart with PM2 first
    if command -v pm2 &> /dev/null; then
        echo "Using PM2 to restart..."
        pm2 restart all
        pm2 status
    else
        echo "PM2 not found. Please restart your server manually:"
        echo "1. Stop current server (Ctrl+C or kill process)"
        echo "2. Run: npm start"
    fi
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED!"
    echo "✅ Admin bookings will now auto-confirm!"
    echo "🧪 Test by creating a new booking in admin panel"
    echo "📧 Confirmation emails will be sent automatically"
    
else
    echo "❌ Database fix failed. Check the error above."
    exit 1
fi








