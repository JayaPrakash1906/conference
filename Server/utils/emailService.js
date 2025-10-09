const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail app password
  }
});

// Function to send registration credentials
const sendRegistrationCredentials = async (email, userId, password) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Meeting Room Booking System - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to Meeting Room Booking System!</h2>
          <p>Your account has been successfully created. Here are your login credentials:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <p>For security reasons, we recommend changing your password after your first login.</p> 
          
          <p style="color: #7f8c8d; font-size: 0.9em;">
            If you did not create this account, please contact our support team immediately.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 0.8em;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper function to format date properly
const formatDateForEmail = (dateString) => {
  if (!dateString) return 'Date not specified';
  
  // Handle different date formats
  let date;
  if (typeof dateString === 'string') {
    // If it's a string like "2025-11-13" or "2025-11-13T00:00:00.000Z"
    date = new Date(dateString);
  } else {
    date = dateString;
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Date not specified';
  }
  
  // Format as "Thursday, November 13, 2025"
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};

// Helper function to format time properly
const formatTimeForEmail = (timeString) => {
  if (!timeString) return 'Time not specified';
  
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Templates for booking status emails
const bookingConfirmedTemplate = (booking) => {
  const formattedDate = formatDateForEmail(booking.date);
  const formattedStartTime = formatTimeForEmail(booking.start_time);
  const formattedEndTime = formatTimeForEmail(booking.end_time);
  
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #27ae60;">Booking Confirmed</h2>
    <p>Dear ${booking.name},</p>
    <p>Your booking for <b>${booking.meeting_name}</b> in <b>${booking.booked_room_name || 'the room'}</b> on <b>${formattedDate}</b> from <b>${formattedStartTime}</b> to <b>${formattedEndTime}</b> has been <b>confirmed</b>.</p>
    <p>Thank you for using our service!</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #7f8c8d; font-size: 0.8em;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </div>
`;
};

const bookingRejectedTemplate = (booking) => {
  const formattedDate = formatDateForEmail(booking.date);
  const formattedStartTime = formatTimeForEmail(booking.start_time);
  const formattedEndTime = formatTimeForEmail(booking.end_time);
  
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #e74c3c;">Booking Rejected</h2>
    <p>Dear ${booking.name},</p>
    <p>We regret to inform you that your booking for <b>${booking.meeting_name}</b> in <b>${booking.booked_room_name || 'the room'}</b> on <b>${formattedDate}</b> from <b>${formattedStartTime}</b> to <b>${formattedEndTime}</b> has been <b>rejected</b>.</p>
    <p>If you have any questions, please contact the admin.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #7f8c8d; font-size: 0.8em;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </div>
`;
};

// Reminder email template
const bookingReminderTemplate = (booking) => {
  const formattedDate = formatDateForEmail(booking.date);
  const formattedStartTime = formatTimeForEmail(booking.start_time);
  const formattedEndTime = formatTimeForEmail(booking.end_time);
  
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f39c12;">Meeting Reminder - 10 Minutes</h2>
    <p>Dear ${booking.name},</p>
    <p>This is a friendly reminder that your meeting <b>${booking.meeting_name}</b> is scheduled to start in <b>10 minutes</b>.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #2c3e50; margin-top: 0;">Meeting Details:</h3>
      <p><strong>Meeting:</strong> ${booking.meeting_name}</p>
      <p><strong>Room:</strong> ${booking.booked_room_name || 'Room not specified'}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Start Time:</strong> ${formattedStartTime}</p>
      <p><strong>End Time:</strong> ${formattedEndTime}</p>
      <p><strong>Purpose:</strong> ${booking.meeting_purpose}</p>
    </div>
    
    <p style="color: #7f8c8d; font-size: 0.9em;">
      Please make sure to arrive on time. If you need to cancel or reschedule, please contact the admin as soon as possible.
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #7f8c8d; font-size: 0.8em;">
        This is an automated reminder, please do not reply to this email.
      </p>
    </div>
  </div>
`;
};

// Generic function to send booking status email
const sendBookingStatusEmail = async (email, status, booking) => {
  let subject, html;
  if (status === 'confirmed') {
    subject = 'Your Booking is Confirmed';
    html = bookingConfirmedTemplate(booking);
  } else if (status === 'rejected') {
    subject = 'Your Booking is Rejected';
    html = bookingRejectedTemplate(booking);
  } else {
    subject = 'Booking Status Updated';
    html = `<p>Your booking status has been updated to <b>${status}</b>.</p>`;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Booking status email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending booking status email:', error);
    throw error;
  }
};

// Function to send reminder email
const sendReminderEmail = async (email, booking) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Meeting Reminder: ${booking.meeting_name} starts in 10 minutes`,
    html: bookingReminderTemplate(booking)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

module.exports = {
  sendRegistrationCredentials,
  sendBookingStatusEmail,
  sendReminderEmail
};
