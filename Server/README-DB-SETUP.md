# Database Setup Instructions

## Overview
The booking system now displays category names and team names instead of IDs in the booking management and my booking pages.

## Setup Steps

### 1. Run Database Schema
First, ensure the database tables are created with the updated schema:

```bash
cd Server
node setup-db.js
```

This will create the necessary tables including the `teams` table.

### 2. Add Sample Data (Optional)
To test the functionality with sample categories and teams:

```bash
cd Server
node sample-data.js
```

This will add sample categories like "Nirmaan", "CFI", etc., and teams like "Machintell_corp".

### 3. Start the Server
```bash
cd Server
npm start
```

## How It Works

### Database Changes
- The `FetchBrowseModel` now joins with `categories` and `teams` tables
- Category names are displayed instead of category IDs
- Team names are displayed instead of team IDs (only when a team is selected)

### Frontend Changes
- **BookingManagement.js**: Shows category and team names in admin view
- **MyBooking.js**: Shows category and team names in user view
- **DetailedBookingCard.js**: Displays team information only when a team is selected

### Display Logic
- **Category**: Always shown (e.g., "Nirmaan")
- **Team**: Only shown when a team is actually selected, displayed below the category with indentation
- If no team is selected, only the category is displayed
- Format example:
  ```
  Category: Nirmaan
    Team: Machintell_corp
  ```

## Troubleshooting

If you see IDs instead of names:
1. Ensure the `teams` table exists in your database
2. Check that categories and teams are properly linked
3. Verify that the booking records have valid category and team IDs

If the teams table doesn't exist:
1. Run `node setup-db.js` to create it
2. Run `node sample-data.js` to add sample data
3. Restart the server 