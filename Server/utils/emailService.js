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
            If you didn't create this account, please contact our support team immediately.
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

// Template for booking confirmed
const bookingConfirmedTemplate = (booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #27ae60;">Booking Confirmed</h2>
    <p>Dear ${booking.name},</p>
    <p>Your booking for <b>${booking.meeting_name}</b> in <b>${booking.booked_room_name || 'the room'}</b> on <b>${booking.date}</b> from <b>${booking.start_time}</b> to <b>${booking.end_time}</b> has been <b>confirmed</b>.</p>
    <p>Thank you for using our service!</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #7f8c8d; font-size: 0.8em;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </div>
`;

// Template for booking rejected
const bookingRejectedTemplate = (booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #e74c3c;">Booking Rejected</h2>
    <p>Dear ${booking.name},</p>
    <p>We regret to inform you that your booking for <b>${booking.meeting_name}</b> in <b>${booking.booked_room_name || 'the room'}</b> on <b>${booking.date}</b> from <b>${booking.start_time}</b> to <b>${booking.end_time}</b> has been <b>rejected</b>.</p>
    <p>If you have any questions, please contact the admin.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #7f8c8d; font-size: 0.8em;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  </div>
`;

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

module.exports = {
  sendRegistrationCredentials,
  sendBookingStatusEmail
}; 