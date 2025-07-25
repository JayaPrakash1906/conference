const {CreateBrowseModel, FetchBrowseModel, UpdateBrowseModel, DeleteBrowseModel, UpdateBrowseStatus}  = require('../model/user_browseroomModel');
const { sendBookingStatusEmail } = require('../utils/emailService');


const CreateBrowse = async (req, res) => {
    const {name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id} = req.body;

    // Basic validation
    if (!name || !meeting_name || !start_time || !end_time || !date || !meeting_purpose || !contact_number || !email || !team_category || !room_id) {
        return res.status(400).json({ status: 'Check all fields' });
    }

    // Get user from request (assuming it's set by auth middleware)
    const userEmail = req.query.email || req.body.email;
    
    // Validate that the booking email matches the logged-in user's email
    if (email !== userEmail) {
        return res.status(403).json({ 
            status: 'Forbidden', 
            message: 'You can only make bookings with your own email address' 
        });
    }

    try {
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
            team_sub_category,
            room_id
        );
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

    if (!id) {
        return res.status(400).json({ error: "Params missing" });  
    }

    try {
        const result = await DeleteBrowseModel(id);  
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message }); 
    }
};

module.exports = { CreateBrowse, FetchBrowse, UpdateBrowse, DeleteBrowse };
