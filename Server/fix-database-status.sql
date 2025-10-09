-- Fix the booking table status column to allow explicit status values
-- Remove the DEFAULT constraint that's overriding our 'confirmed' status

-- Step 1: Remove the DEFAULT constraint
ALTER TABLE booking ALTER COLUMN status DROP DEFAULT;

-- Step 2: Verify the change
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'booking' AND column_name = 'status';

-- Step 3: Test by inserting a booking with confirmed status
INSERT INTO booking 
(name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, nirmaan_text, room_id, status) 
VALUES 
('Test Admin', 'Test Admin Meeting', '2025-01-01 10:00:00', '2025-01-01 11:00:00', '2025-01-01', 'Test admin booking', '1234567890', 'admin@test.com', '1', 'Test Team', '', 1, 'confirmed') 
RETURNING *;

-- Clean up test data
DELETE FROM booking WHERE email = 'admin@test.com';
