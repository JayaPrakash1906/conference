const {CreateBrowseModel, FetchBrowseModel, UpdateBrowseModel, DeleteBrowseModel, UpdateBrowseStatus, GetBookingById}  = require('../model/user_browseroomModel');
const { sendBookingStatusEmail } = require('../utils/emailService');


const CreateBrowse = async (req, res) => {
    const {name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, nirmaan_text, status} = req.body;

    // Debug logging - see what's actually being received
    console.log('=== BOOKING CREATION REQUEST ===');
    console.log('Full request body:', req.body);
    console.log('Status received:', status);
    console.log('Status type:', typeof status);
    console.log('================================');

    // Basic validation
    if (!name || !meeting_name || !start_time || !end_time || !date || !meeting_purpose || !contact_number || !email || !team_category || !room_id) {
        return res.status(400).json({ status: 'Check all fields' });
    }

    // Get user from request (assuming it's set by auth middleware)
    const userEmail = req.query.email || req.body.email;
    
    try {
        // Check user's role from database for security
        const { Pool } = require('pg');
        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'calendar',
            password: process.env.DB_PASSWORD || 'root',
            port: process.env.DB_PORT || 5432,
        });

        const userRoleCheck = await pool.query(
            'SELECT role FROM users WHERE email = $1', 
            [userEmail]
        );

        const userRole = userRoleCheck.rows[0]?.role || 'user';
        const isAdmin = userRole === 'admin';
        
        console.log(`User ${userEmail} role: ${userRole}, isAdmin: ${isAdmin}`);
        
        // Determine final status based on role and request
        let finalStatus;
        if (isAdmin) {
            // Admin bookings are automatically confirmed unless explicitly set to pending
            if (status === 'pending') {
                finalStatus = 'pending';
                console.log('Admin explicitly chose pending booking');
            } else {
                finalStatus = 'confirmed';
                console.log('Admin creating auto-confirmed booking');
            }
        } else {
            // Users can only create pending bookings
            finalStatus = 'pending';
            console.log('User creating pending booking (requires approval)');
        }
        
        // For admin bookings, allow booking for any email
        // For user bookings, validate email matches logged-in user
        if (!isAdmin && email !== userEmail) {
            await pool.end();
            return res.status(403).json({ 
                status: 'Forbidden', 
                message: 'You can only make bookings with your own email address' 
            });
        }

        await pool.end();
        
        // For Nirmaan Teams, use nirmaan_text as team_sub_category if provided
        let finalTeamSubCategory = team_sub_category;
        if (nirmaan_text && nirmaan_text.trim()) {
            finalTeamSubCategory = nirmaan_text.trim();
        }
        
        // Create booking with role-based status
        console.log(`Creating booking with final status: ${finalStatus}`);
        
        let result;
        if (finalStatus === 'confirmed') {
            // Create booking as pending first (to avoid DEFAULT constraint)
            result = await CreateBrowseModel(
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
                'pending'
            );
            
            console.log('Booking created as pending, updating to confirmed...');
            
            // Immediately update to confirmed using raw SQL to bypass any constraints
            const { Pool } = require('pg');
            const pool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: process.env.DB_NAME || 'calendar',
                password: process.env.DB_PASSWORD || 'root',
                port: process.env.DB_PORT || 5432,
            });
            
            const updateResult = await pool.query(
                'UPDATE booking SET status = $1 WHERE id = $2 RETURNING *',
                ['confirmed', result.id]
            );
            
            if (updateResult.rows.length > 0) {
                result = updateResult.rows[0];
                console.log('Booking updated to confirmed:', result.status);
            } else {
                console.log('Warning: Could not update booking to confirmed status');
            }
            
            await pool.end();
        } else {
            // Create pending booking
            result = await CreateBrowseModel(
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
                finalStatus
            );
            console.log('Pending booking created:', result.status);
        }

        // Auto-send confirmation email for confirmed bookings
        if (finalStatus === 'confirmed') {
            try {
                // Get the room name for the email
                const { Pool } = require('pg');
                const pool = new Pool({
                    user: process.env.DB_USER || 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    database: process.env.DB_NAME || 'calendar',
                    password: process.env.DB_PASSWORD || 'root',
                    port: process.env.DB_PORT || 5432,
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
        // Check if requester is admin
        const { Pool } = require('pg');
        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'calendar',
            password: process.env.DB_PASSWORD || 'root',
            port: process.env.DB_PORT || 5432,
        });

        const userRoleCheck = await pool.query(
            'SELECT role FROM users WHERE email = $1', 
            [requesterEmail]
        );

        const userRole = userRoleCheck.rows[0]?.role || 'user';
        const isAdmin = userRole === 'admin';
        
        await pool.end();

        const booking = await GetBookingById(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Both admin and users can only delete their own bookings
        if (String(booking.email).toLowerCase() !== String(requesterEmail).toLowerCase()) {
            return res.status(403).json({ 
                error: "You can only delete your own bookings." 
            });
        }

        console.log(`${isAdmin ? 'Admin' : 'User'} ${requesterEmail} deleting booking ${id} (owner: ${booking.email})`);
        console.log('Delete permission check:', {
            isAdmin,
            requesterEmail,
            bookingOwner: booking.email,
            canDelete: String(booking.email).toLowerCase() === String(requesterEmail).toLowerCase()
        });
        
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
