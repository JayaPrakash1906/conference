const pool = require('../config/db');

const checkOverlappingBookings = async (room_id, date, start_time, end_time, excludeBookingId = null) => {
  try {
    // Format the time values properly by combining them with the date
    const formatTimeToTimestamp = (timeStr, dateStr) => {
      if (!timeStr || !dateStr) return null;
      return `${dateStr} ${timeStr}`;
    };

    const formattedStartTime = formatTimeToTimestamp(start_time, date);
    const formattedEndTime = formatTimeToTimestamp(end_time, date);

    let query = `
      SELECT COUNT(*) 
      FROM booking 
      WHERE room_id = $1 
      AND date = $2::date
      AND status != 'rejected'
      AND (
        (start_time <= $3::timestamp AND end_time > $3::timestamp) OR
        (start_time < $4::timestamp AND end_time >= $4::timestamp) OR
        (start_time >= $3::timestamp AND end_time <= $4::timestamp)
      )`;
    
    const values = [room_id, date, formattedStartTime, formattedEndTime];
    
    if (excludeBookingId) {
      query += ` AND id != $5`;
      values.push(excludeBookingId);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    throw error;
  }
};

const CreateBrowseModel = async (
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
) => {
  try {
    // Convert time and date to timestamp
    const formatTimeToTimestamp = (timeStr, dateStr) => {
      if (!timeStr || !dateStr) return null;
      // Combine date and time into a timestamp
      return `${dateStr} ${timeStr}`;
    };

    // Format the timestamps for both checking overlap and insertion
    const formattedStartTime = formatTimeToTimestamp(start_time, date);
    const formattedEndTime = formatTimeToTimestamp(end_time, date);

    // Check for overlapping bookings
    const hasOverlap = await checkOverlappingBookings(
      room_id,
      date,
      start_time,
      end_time
    );

    if (hasOverlap) {
      throw new Error('This room is already booked for the selected time slot');
    }

    const result = await pool.query(
      `INSERT INTO booking 
       (name, meeting_name, start_time, end_time, date, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id) 
       VALUES ($1, $2, $3::timestamp, $4::timestamp, $5::date, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        name,
        meeting_name,
        formattedStartTime,
        formattedEndTime,
        date,
        meeting_purpose,
        contact_number,
        email,
        team_category,
        team_sub_category,
        room_id
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};


const FetchBrowseModel = (userEmail = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        b.id,
        b.meeting_name,
        b.date,
        to_char(b.start_time, 'HH24:MI') as start_time,
        to_char(b.end_time, 'HH24:MI') as end_time,
        b.meeting_purpose,
        b.status,
        b.team_category,
        b.team_sub_category,
        b.contact_number,
        b.email,
        b.name,
        b.room_id,
        COALESCE(r.name, 'Room not found') as booked_room_name,
        COALESCE(c.name, b.team_category) as category_name,
        COALESCE(t.name, NULLIF(b.team_sub_category, '')) as team_name
      FROM booking b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN categories c ON b.team_category = c.id::text
      LEFT JOIN teams t ON b.team_sub_category = t.id::text`;

    const values = [];
    
    if (userEmail) {
      query += ` WHERE b.email = $1`;
      values.push(userEmail);
    }

    query += `
      ORDER BY 
        CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
        b.date DESC,
        b.start_time ASC`;

    pool.query(query, values, (err, result) => {
      if(err) {
        console.error('Database query error:', err);
        reject(err);
      }
      else {
        console.log('Found bookings:', result.rows.length);
        resolve(result);
      }
    });
  });
};

const UpdateBrowseModel = async (name, meeting_name, date, start_time, end_time, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, id) => {
  try {
    const query = `
      UPDATE booking
      SET name=$1, meeting_name=$2, date=$3, start_time=$4, end_time=$5, meeting_purpose=$6, contact_number=$7, email=$8, team_category=$9, team_sub_category=$10, room_id=$11
      WHERE id=$12 RETURNING *`;
    
    const values = [name, meeting_name, date, start_time, end_time, meeting_purpose, contact_number, email, team_category, team_sub_category, room_id, id];

    const result = await pool.query(query, values);
    return result; // Return the updated row
  } catch (error) {
    throw error;
  }
};

const DeleteBrowseModel = (id) => {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM booking WHERE id = $1', [id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.rowCount === 0) {
          resolve({ status: "No matching record found" });
        } else {
          resolve({ status: `Deleted booking ${id}` });
        }
      }
    });
  });
};

const UpdateBrowseStatus = async (id, status, updated_at) => {
  try {
    // First, check if updated_at column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'booking' AND column_name = 'updated_at'
    `);

    let query;
    let values;

    if (checkColumn.rows.length === 0) {
      // If updated_at column doesn't exist, only update status
      query = `
        UPDATE booking
        SET status = $1
        WHERE id = $2
        RETURNING *`;
      values = [status, id];
    } else {
      // If updated_at column exists, update both status and updated_at
      query = `
        UPDATE booking
        SET status = $1, updated_at = $2
        WHERE id = $3
        RETURNING *`;
      values = [status, updated_at, id];
    }

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating booking status:', error);
    // Add more specific error handling
    if (error.code === '42P01') {
      throw new Error('Table does not exist');
    } else if (error.code === '23505') {
      throw new Error('Duplicate key violation');
    } else if (error.code === '23503') {
      throw new Error('Foreign key violation');
    } else if (error.code === '42703') {
      throw new Error('Column does not exist');
    }
    throw error;
  }
};

module.exports = {CreateBrowseModel, FetchBrowseModel, UpdateBrowseModel, DeleteBrowseModel, UpdateBrowseStatus};

