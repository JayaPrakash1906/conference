const pool = require('./config/db');
const { sendReminderEmail } = require('./utils/emailService');

// Enhanced reminder function with multiple notification times
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    
    // Define reminder intervals (in minutes before meeting)
    const reminderIntervals = [
      { minutes: 10, type: '10min' }
    ];
    
    for (const interval of reminderIntervals) {
      const reminderTime = new Date(now.getTime() + interval.minutes * 60 * 1000);
      
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];
      const reminderDate = reminderTime.toISOString().split('T')[0];
      const reminderTimeStr = reminderTime.toTimeString().split(' ')[0];
      
      // Check if we need to add the reminder column first
      try {
        await pool.query(`
          ALTER TABLE booking 
          ADD COLUMN IF NOT EXISTS reminder_10min_sent BOOLEAN DEFAULT FALSE
        `);
      } catch (alterError) {
        // Column might already exist, continue
        console.log('Reminder column check completed');
      }
      
      const query = `
        SELECT 
          b.id, b.meeting_name, b.date, b.meeting_purpose,
          to_char(b.start_time, 'HH24:MI') as start_time,
          to_char(b.end_time, 'HH24:MI') as end_time,
          b.email, b.name, b.room_id,
          COALESCE(r.name, 'Room not found') as booked_room_name,
          b.reminder_10min_sent
        FROM booking b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.status = 'confirmed'
          AND (
            (b.date = $1::date AND to_char(b.start_time, 'HH24:MI') = $2) OR
            (b.date = $3::date AND to_char(b.start_time, 'HH24:MI') = $4)
          )
      `;
      
      const result = await pool.query(query, [currentDate, currentTime, reminderDate, reminderTimeStr]);
      
      for (const booking of result.rows) {
        try {
          // Check if this specific reminder type has already been sent
          const reminderColumn = `reminder_${interval.type}_sent`;
          const alreadySent = booking[reminderColumn];
          
          if (alreadySent) {
            continue; // Skip if this reminder type was already sent
          }
          
          // Send reminder to the user's email
          await sendReminderEmail(booking.email, booking, interval);
          await pool.query(`UPDATE booking SET ${reminderColumn} = true WHERE id = $1`, [booking.id]);
          console.log(`${interval.minutes}-minute reminder sent to ${booking.email} for: ${booking.meeting_name}`);
        } catch (error) {
          console.error(`Failed to send ${interval.minutes}-minute reminder for booking ${booking.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Start checking every minute
setInterval(checkAndSendReminders, 60000);

console.log('Reminder system started - checking every minute');
console.log('10-minute reminder emails will be sent automatically');

module.exports = { checkAndSendReminders };
