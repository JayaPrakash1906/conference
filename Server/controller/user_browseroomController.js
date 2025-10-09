const {CreateBrowseModel, FetchBrowseModel, UpdateBrowseModel, DeleteBrowseModel, UpdateBrowseStatus, GetBookingById}  = require('../model/user_browseroomModel');
const { sendBookingStatusEmail } = require('../utils/emailService');


const CreateBrowse = async (req, res) => {
    const {name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, nirmaan_text, status} = req.body;

    // Basic validation
    if (!name || !meeting_name || !start_time || !end_time || !date || !meeting_purpose || !contact_number || !email || !team_category || !room_id) {
        return res.status(400).json({ status: 'Check all fields' });
    }

    // Get user from request (assuming it's set by auth middleware)
    const userEmail = req.query.email || req.body.email;
    
    // For admin bookings, skip email validation as admin can book for anyone
    const isAdminBooking = status === 'confirmed';
    
    // Validate that the booking email matches the logged-in user's email (only for non-admin bookings)
    if (!isAdminBooking && email !== userEmail) {
        return res.status(403).json({ 
            status: 'Forbidden', 
            message: 'You can only make bookings with your own email address' 
        });
    }

    try {
        // For Nirmaan Teams, use nirmaan_text as team_sub_category if provided
        let finalTeamSubCategory = team_sub_category;
        if (nirmaan_text && nirmaan_text.trim()) {
            finalTeamSubCategory = nirmaan_text.trim();
        }
        
        // Debug logging
        console.log('Admin booking status being sent:', status);
        console.log('Is admin booking:', status === 'confirmed');
        
        // Create the booking with the specified status
        const result = await CreateBrowseModel(
            name,
            meeting_name,
            start_time,
            end_time,
            date,
            meeting_purpose,
            contact_number,
            email,
            team_category,
            finalTeamSubCategory,
            room_id,
            nirmaan_text,
            status || 'pending'
        );
        
        console.log('Booking created with status:', result.status);

        // Auto-send confirmation email for admin bookings (confirmed status)
        if (status === 'confirmed') {
            try {
                // Get the room name for the email
                const { Pool } = require('pg');
                const pool = new Pool({
                    user: process.env.DB_USER || 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    database: process.env.DB_NAME || 'calendar',
                    password: process.env.DB_PASSWORD || '5432',
                    port: process.env.DB_PORT || 5001,
                });

                const roomQuery = await pool.query('SELECT name FROM rooms WHERE id = $1', [room_id]);
                const roomName = roomQuery.rows[0]?.name || 'Room not found';

                // Create booking object for email template
                const bookingForEmail = {
                    ...result,
                    booked_room_name: roomName,
                    name: name,
                    meeting_name: meeting_name,
                    date: date,
                    start_time: start_time,
                    end_time: end_time,
                    meeting_purpose: meeting_purpose
                };

                console.log('Sending auto-confirmation email for admin booking:', email);
                await sendBookingStatusEmail(email, 'confirmed', bookingForEmail);
                console.log('Auto-confirmation email sent successfully');
            } catch (emailErr) {
                console.error('Failed to send auto-confirmation email for admin booking:', emailErr);
                // Don't fail the booking creation if email fails
            }
        }

        return res.status(201).json(result);
    } catch (err) {
        console.error("Error creating booking:", err);
        
        // Handle overlapping booking error
        if (err.message === 'This room is already booked for the selected time slot') {
            return res.status(409).json({ 
                status: 'Conflict',
                message: 'This room is already booked for the selected time slot. Please choose a different time or room.' 
            });
        }
        
        return res.status(500).json({ 
            status: 'Internal Server Error',
            message: err.message 
        });
    }
};


const FetchBrowse = async(req, res) => {
    try {
        const userEmail = req.query.email;
        const result = await FetchBrowseModel(userEmail);
        return res.status(200).json(result);
    } catch(err) {
        console.error(err);
        return res.status(500).json({status: 'Internal Server Error'});
    }
};

const UpdateBrowse = async (req, res) => {  
    const id = req.params.id;
    const { status, updated_at } = req.body;
    
    if (!id || !status) {
        return res.status(400).json({ 
            success: false,
            message: "Missing required fields: id and status" 
        });
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'rejected'];
    if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid status value. Must be: pending, confirmed, or rejected" 
        });
    }
    
    try {
        // Update the booking status
        const result = await UpdateBrowseStatus(
            id,
            status.toLowerCase(),
            updated_at || new Date().toISOString()
        );

        // Fetch the full booking details for the updated booking
        const allBookings = await FetchBrowseModel();
        const booking = allBookings.rows.find(b => String(b.id) === String(id));

        // Send email to user if status is confirmed or rejected and booking details are found
        if (booking && (status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'rejected')) {
            try {
                console.log('About to send booking status email:', booking.email, status.toLowerCase(), booking);
                await sendBookingStatusEmail(booking.email, status.toLowerCase(), booking);
            } catch (emailErr) {
                console.error('Failed to send booking status email:', emailErr);
            }
        } else if (!booking) {
            console.error('Booking details not found for email notification.');
        }

        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: result
        });
    } catch (err) {
        console.error("Error updating booking status:", err);
        
        // Handle specific error cases
        switch(err.message) {
            case 'Booking not found':
                return res.status(404).json({ 
                    success: false,
                    message: "Booking not found" 
                });
            case 'Table does not exist':
                return res.status(500).json({ 
                    success: false,
                    message: "Database table not found. Please contact system administrator." 
                });
            case 'Column does not exist':
                return res.status(500).json({ 
                    success: false,
                    message: "Database schema mismatch. Please contact system administrator." 
                });
            case 'Foreign key violation':
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid booking reference." 
                });
            default:
                // Log the full error for debugging
                console.error('Detailed error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: "An unexpected error occurred. Please try again or contact support if the problem persists." 
                });
        }
    }
};

const DeleteBrowse = async (req, res) => {
    const id = req.params.id;
    const requesterEmail = req.query.email;

    if (!id) {
        return res.status(400).json({ error: "Params missing" });
    }
    if (!requesterEmail) {
        return res.status(400).json({ error: "Email query param required" });
    }

    try {
        const booking = await GetBookingById(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        if (String(booking.email).toLowerCase() !== String(requesterEmail).toLowerCase()) {
            return res.status(403).json({ error: "You can only delete your own bookings" });
        }

        const result = await DeleteBrowseModel(id);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


// Bulk create events
const BulkCreateEvents = async (req, res) => {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
        return res.status(400).json({ error: "Events array is required" });
    }

    try {
        const results = [];
        const errors = [];

        for (const event of events) {
            try {
                const result = await CreateBrowseModel(
                    event.name,
                    event.meeting_name,
                    event.start_time,
                    event.end_time,
                    event.date,
                    event.meeting_purpose,
                    event.contact_number,
                    event.email,
                    event.team_category,
                    event.team_sub_category,
                    event.room_id,
                    event.nirmaan_text
                );
                results.push(result);
            } catch (err) {
                errors.push({
                    event: event.meeting_name,
                    error: err.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            created: results.length,
            errors: errors.length,
            results,
            errors
        });
    } catch (err) {
        console.error("Error in bulk create:", err);
        return res.status(500).json({ error: err.message });
    }
};

// Bulk update events
const BulkUpdateEvents = async (req, res) => {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
        return res.status(400).json({ error: "Events array is required" });
    }

    try {
        const results = [];
        const errors = [];

        for (const event of events) {
            try {
                const result = await UpdateBrowseModel(
                    event.id,
                    event.name,
                    event.meeting_name,
                    event.start_time,
                    event.end_time,
                    event.date,
                    event.meeting_purpose,
                    event.contact_number,
                    event.email,
                    event.team_category,
                    event.team_sub_category,
                    event.room_id,
                    event.nirmaan_text
                );
                results.push(result);
            } catch (err) {
                errors.push({
                    event: event.meeting_name,
                    error: err.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            updated: results.length,
            errors: errors.length,
            results,
            errors
        });
    } catch (err) {
        console.error("Error in bulk update:", err);
        return res.status(500).json({ error: err.message });
    }
};

// Bulk delete events
const BulkDeleteEvents = async (req, res) => {
    const { eventIds } = req.body;
    
    if (!eventIds || !Array.isArray(eventIds)) {
        return res.status(400).json({ error: "Event IDs array is required" });
    }

    try {
        const results = [];
        const errors = [];

        for (const id of eventIds) {
            try {
                const result = await DeleteBrowseModel(id);
                results.push(result);
            } catch (err) {
                errors.push({
                    id,
                    error: err.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            deleted: results.length,
            errors: errors.length,
            results,
            errors
        });
    } catch (err) {
        console.error("Error in bulk delete:", err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    CreateBrowse, 
    FetchBrowse, 
    UpdateBrowse, 
    DeleteBrowse,
    BulkCreateEvents,
    BulkUpdateEvents,
    BulkDeleteEvents
};
