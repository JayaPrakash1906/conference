const pool = require('./config/db');
const { sendReminderEmail } = require('./utils/emailService');

// Simple reminder function
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    const reminderDate = tenMinutesFromNow.toISOString().split('T')[0];
    const reminderTime = tenMinutesFromNow.toTimeString().split(' ')[0];
    
    const query = `
      SELECT 
        b.id, b.meeting_name, b.date, b.meeting_purpose,
        to_char(b.start_time, 'HH24:MI') as start_time,
        to_char(b.end_time, 'HH24:MI') as end_time,
        b.email, b.name, b.room_id,
        COALESCE(r.name, 'Room not found') as booked_room_name
      FROM booking b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'confirmed'
        AND b.reminder_sent = false
        AND (
          (b.date = $1::date AND to_char(b.start_time, 'HH24:MI') = $2) OR
          (b.date = $3::date AND to_char(b.start_time, 'HH24:MI') = $4)
        )
    `;
    
    const result = await pool.query(query, [currentDate, currentTime, reminderDate, reminderTime]);
    
    for (const booking of result.rows) {
      try {
        // Send reminder to the user's email
        await sendReminderEmail(booking.email, booking);
        await pool.query('UPDATE booking SET reminder_sent = true WHERE id = $1', [booking.id]);
        console.log(`Reminder sent to ${booking.email} for: ${booking.meeting_name}`);
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Start checking every minute
setInterval(checkAndSendReminders, 60000);

console.log('Reminder system started - checking every minute');
console.log('All reminder emails will be sent to: jayaprakashtrk8@gmail.com');

module.exports = { checkAndSendReminders };
