import React, { useState, useEffect } from 'react';
import Navbar from "../../components/UserNavbar";
import { Clock, MapPin } from "lucide-react";
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchBookings = async () => {
    try {
      // Get current user's email from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.email) {
        throw new Error('User not found');
      }

      const response = await axios.get(`http://13.127.171.141:5000/api/get_browseroom?email=${user.email}`);

      if (!response.data || !response.data.rows) {
        throw new Error('Invalid response format');
      }

      const transformed = response.data.rows.map(booking => {
        // Format time to 12-hour format
        const formatTime = (timeStr) => {
          if (!timeStr) return '';
          // Input is in 24-hour format (HH:MM)
          const [hours, minutes] = timeStr.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
        };

        const formattedTime = `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`;

        // Helper to check if a value is a number
        const isNumber = (val) => !isNaN(val) && !isNaN(parseFloat(val));
        const categoryDisplay =
          !isNumber(booking.category_name) && booking.category_name
            ? booking.category_name
            : (!isNumber(booking.team_category) && booking.team_category
                ? booking.team_category
                : "Unknown Category");

        const transformedBooking = {
          id: booking.id,
          title: booking.meeting_name || 'Untitled Meeting',
          roomName: booking.booked_room_name,
          date: dayjs(booking.date).format('dddd, MMMM D, YYYY'),
          time: formattedTime,
          rawStartTime: booking.start_time,
          rawEndTime: booking.end_time,
          status: booking.status || 'pending',
          updatedAt: booking.updated_at,
          rawDate: booking.date,
          notes: booking.meeting_purpose,
          bookedBy: booking.name,
          contactNumber: booking.contact_number,
          email: booking.email,
          team: categoryDisplay,
          subTeam: booking.team_name || booking.team_sub_category || booking.subTeam || booking.team || '—',
          team_category: booking.team_category,
          team_sub_category: booking.team_sub_category
        };
        // Debug: log booking data
        // console.log('Booking:', booking, 'Transformed:', transformedBooking);
        return transformedBooking;
      });

      // Sort bookings: pending first, then by update time, then by date
      const sorted = transformed.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        
        // If status is the same, sort by update time (most recent first)
        const aUpdate = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const bUpdate = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        if (aUpdate.getTime() !== bUpdate.getTime()) {
          return bUpdate.getTime() - aUpdate.getTime();
        }
        
        // If update time is the same, sort by date
        return dayjs(b.date).diff(dayjs(a.date));
      });

      setBookings(sorted);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching bookings:", err);
      if (err.message === 'User not found') {
        setError("Please log in to view your bookings");
        toast.error("Please log in to view your bookings");
      } else {
        setError("Unable to load bookings. Try again later.");
        toast.error("Unable to load bookings. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  // Set up polling to refresh data every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const otherBookings = bookings.filter(b => b.status !== 'pending');

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-4 sm:p-6 md:p-10 bg-gray-50 min-h-screen mt-28 sm:mt-32">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold">My Bookings</h2>
          <div className="text-xs sm:text-sm text-gray-500">
            Last updated: {dayjs(lastUpdate).format('HH:mm:ss')}
          </div>
        </div>

        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Pending Approvals</h3>
            <div className="space-y-4 max-w-6xl mx-auto">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {pendingBookings.length > 0 ? 'Other Bookings' : 'All Bookings'}
          </h3>
          <div className="space-y-4 max-w-6xl mx-auto">
            {otherBookings.length === 0 && pendingBookings.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500">No bookings found</p>
              </div>
            ) : (
              otherBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingCard = ({ booking }) => (
  <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
    <div className="flex flex-row justify-between items-center mb-2 sm:mb-3 gap-2">
      <div className="min-w-0">
        <h4 className="text-base sm:text-lg font-semibold truncate">{booking.title}</h4>
        <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
          <MapPin className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="font-medium text-blue-600 truncate">{booking.roomName}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
          <Clock className="w-4 h-4 mr-1 sm:mr-2" />
          <span>{booking.time}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`${getStatusColor(booking.status)} text-xs font-medium px-2 sm:px-3 py-1 rounded-full capitalize whitespace-nowrap`}>
          {booking.status}
        </span>
        {booking.updatedAt && (
          <span className="text-xs text-gray-500">
            Updated: {dayjs(booking.updatedAt).format('HH:mm:ss')}
          </span>
        )}
      </div>
    </div>

    {booking.notes && (
      <div className="bg-gray-50 text-xs sm:text-sm text-gray-700 p-2 sm:p-3 rounded-md">
        <strong>Meeting Purpose:</strong> {booking.notes}
      </div>
    )}
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mt-3 sm:mt-4">
      <div className="space-y-1">
        <p><strong>Booked By:</strong> {booking.bookedBy}</p>
        <p><strong>Contact:</strong> {booking.contactNumber}</p>
        <p className="truncate"><strong>Email:</strong> {booking.email}</p>
      </div>
      <div className="space-y-1">
        {/* Always show category/team section */}
        <p><strong>Category:</strong> {booking.team}</p>
        <p><strong>Team:</strong> {booking.subTeam || '—'}</p>
      </div>
    </div>
  </div>
);

export default MyBooking;