-- Remove the DEFAULT constraint from the status column
-- This will allow us to explicitly set the status to 'confirmed' for admin bookings

ALTER TABLE booking ALTER COLUMN status DROP DEFAULT;

-- Verify the change
\d booking;
