import React, { useState, useEffect } from 'react';
import { Filter, X, Check, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, Phone, Mail, Target } from 'lucide-react';
import Navbar from '../../components/AdminNavbar';
import axios from 'axios';
import dayjs from 'dayjs';
import DetailedBookingCard from './DetailedBookingCard';

const NotificationToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-[#1a1a1a] text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 bg-[#2b2b2b] hover:bg-[#3b3b3b] text-sm px-3 py-1 rounded-full transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

const BookingManagement = () => {
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [categoryMap, setCategoryMap] = useState({});

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/');
        const cats = await res.json();
        // Build id->name map
        const map = {};
        (Array.isArray(cats) ? cats : []).forEach(cat => {
          map[cat.id] = cat.name;
        });
        setCategoryMap(map);
      } catch (e) {
        setCategoryMap({});
      }
    };
    fetchCategories();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/get_browseroom");
      if (!response.data || !response.data.rows) {
        throw new Error('Invalid response format');
      }

      const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
      };

      const transformedBookings = response.data.rows.map(booking => {
        const formattedTime = `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`;

        // Helper to check if a value is a number
        const isNumber = (val) => !isNaN(val) && !isNaN(parseFloat(val));
        let categoryDisplay = '';
        if (!isNumber(booking.category_name) && booking.category_name) {
          categoryDisplay = booking.category_name;
        } else if (!isNumber(booking.team_category) && booking.team_category) {
          categoryDisplay = booking.team_category;
        } else if (isNumber(booking.team_category) && categoryMap[booking.team_category]) {
          categoryDisplay = categoryMap[booking.team_category];
        } else {
          categoryDisplay = 'Unknown Category';
        }

        return {
          id: booking.id,
          title: booking.meeting_name || 'Untitled Meeting',
          user: booking.name,
          status: booking.status || 'Pending',
          room: booking.booked_room_name,
          location: `${booking.location || 'Location not specified'}`,
          date: dayjs(booking.date).format('ddd, MMM D, YYYY'),
          time: formattedTime,
          rawStartTime: booking.start_time,
          rawEndTime: booking.end_time,
          notes: booking.meeting_purpose,
          team: categoryDisplay,
          subTeam: booking.team_name || booking.team_sub_category || booking.subTeam || booking.team || '—',
          team_category: booking.team_category,
          team_sub_category: booking.team_sub_category,
          contactNumber: booking.contact_number,
          email: booking.email,
          rawDate: dayjs(booking.date).format('YYYY-MM-DD')
        };
      });

      const sorted = transformedBookings.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return dayjs(b.rawDate).diff(dayjs(a.rawDate));
      });

      setBookings(sorted);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Unable to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (message) => {
    setNotification({ show: true, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '' });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/update_browseroom/${id}`, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'No response from server');
      }

      // Close the modal immediately
      closeBookingModal();
      
      // Update the local state immediately for instant feedback
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === id 
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      const actionMessages = {
        rejected: 'Booking cancelled successfully',
        confirmed: 'Booking confirmed successfully'
      };

      showNotification(actionMessages[newStatus] || 'Booking status updated successfully');

      // Fetch fresh data in background
      setTimeout(() => {
        fetchBookings();
      }, 1000);

    } catch (error) {
      console.error("Error updating booking status:", error);
      let errorMessage = "Failed to update booking status. ";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (!error.response) {
        errorMessage = 'No response from server. Please try again later.';
      }

      showNotification(errorMessage);

      if (error.response?.status === 500) {
        await fetchBookings();
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getBookingsForDate = (date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    return filteredBookings.filter(booking => booking.rawDate === dateStr);
  };

  const getBookingsForWeek = (startDate) => {
    const weekBookings = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateBookings = getBookingsForDate(date);
      weekBookings.push({ date, bookings: dateBookings });
    }
    return weekBookings;
  };

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const closeBookingModal = () => setSelectedBooking(null);

  const toggleExpandedDay = (dateStr) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const BookingCard = ({ booking }) => (
    <div className={`p-2 sm:p-3 rounded-lg border-l-4 ${
      booking.status.toLowerCase() === 'confirmed' ? 'border-green-500 bg-green-50' :
      booking.status.toLowerCase() === 'pending' ? 'border-yellow-500 bg-yellow-50' :
      'border-red-500 bg-red-50'
    } mb-2`}> 
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{booking.title}</h4>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            {booking.time}
          </div>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {booking.room}
          </div>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <Phone className="w-3 h-3 mr-1" />
            {booking.contactNumber}
          </div>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <Target className="w-3 h-3 mr-1" />
            <span>
              {booking.team}
              {booking.subTeam && booking.subTeam.trim() !== '' ? ` - ${booking.subTeam}` : ''}
            </span>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-1 sm:gap-2 items-end sm:items-start w-full sm:w-auto">
          {booking.status.toLowerCase() === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                className="flex items-center text-green-600 hover:text-green-900 text-xs w-full sm:w-auto"
              >
                <Check className="w-3 h-3 mr-1" />
                Confirm
              </button>
              <button
                onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                className="flex items-center text-red-600 hover:text-red-900 text-xs w-full sm:w-auto"
              >
                <X className="w-3 h-3 mr-1" />
                Reject
              </button>
            </>
          )}
          {booking.status.toLowerCase() === 'confirmed' && (
            <button
              onClick={() => handleUpdateStatus(booking.id, 'rejected')}
              className="flex items-center text-red-600 hover:text-red-900 text-xs w-full sm:w-auto"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const days = getCalendarDays(currentDate);
    const currentMonth = currentDate.getMonth();
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-0 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {days.map((day, index) => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`min-h-24 p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, expandedDays.has(day.toDateString()) ? dayBookings.length : 2).map(booking => (
                    <div
                      key={booking.id}
                      className={`text-xs p-1 rounded truncate ${
                        booking.status.toLowerCase() === 'confirmed' ? 'bg-green-200 text-green-800' :
                        booking.status.toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      } cursor-pointer hover:opacity-80`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      {booking.title}
                    </div>
                  ))}
                  {dayBookings.length > 2 && !expandedDays.has(day.toDateString()) && (
                    <div 
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                      onClick={() => toggleExpandedDay(day.toDateString())}
                    >
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                  {dayBookings.length > 2 && expandedDays.has(day.toDateString()) && (
                    <div 
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                      onClick={() => toggleExpandedDay(day.toDateString())}
                    >
                      Show less
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekBookings = getBookingsForWeek(startOfWeek);
    const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8am to 8pm

    // Helper to get bookings for a day and hour
    const getBookingsForDayHour = (date, hour) => {
      return (weekBookings.find(d => d.date.toDateString() === date.toDateString())?.bookings || []).filter(b => {
        const [h] = b.rawStartTime ? b.rawStartTime.split(":") : [null];
        return parseInt(h, 10) === hour;
      });
    };

    return (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-8 border-b">
          <div className="bg-gray-100 p-2 border-r"></div>
          {weekBookings.map(({ date }, idx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className={`text-center p-2 border-r last:border-r-0 font-medium ${isToday ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-100'}`}>{date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</div>
            );
          })}
        </div>
        <div className="min-w-[900px] grid grid-cols-8">
          {/* Time slots */}
          <div className="flex flex-col border-r">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b text-xs text-gray-400 flex items-start justify-end pr-2 pt-1">
                {hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </div>
            ))}
          </div>
          {/* Day columns */}
          {weekBookings.map(({ date }, dayIdx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={dayIdx} className={`flex flex-col border-r last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}> 
                {hours.map(hour => (
                  <div key={hour} className="h-16 border-b relative">
                    {getBookingsForDayHour(date, hour).map(booking => (
                      <div key={booking.id} className="absolute left-1 right-1 top-1 bottom-1 bg-blue-500 text-white text-xs rounded shadow flex items-center px-2 overflow-hidden cursor-pointer" title={booking.title} onClick={() => setSelectedBooking(booking)}>
                        {booking.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = getBookingsForDate(currentDate);
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-base sm:text-xl font-semibold mb-4 text-center sm:text-left break-words">{formatDate(currentDate)}</h2>
        <div className="space-y-4">
          {dayBookings.length > 0 ? (
            dayBookings.map(booking => (
              <div className="">
                <DetailedBookingCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No bookings for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedBookings = [...filteredBookings].sort((a, b) => {
      const dateA = dayjs(a.rawDate);
      const dateB = dayjs(b.rawDate);
      return dateA.diff(dateB);
    });
    const groupedBookings = sortedBookings.reduce((groups, booking) => {
      const date = booking.rawDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(booking);
      return groups;
    }, {});
    return (
      <div className="bg-white rounded-lg shadow">
        {Object.entries(groupedBookings).map(([date, bookings]) => (
          <div key={date} className="border-b last:border-b-0">
            <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">
                {dayjs(date).format('dddd, MMMM D, YYYY')}
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {bookings.map(booking => (
                <div className="">
                  <DetailedBookingCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedBookings).length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No bookings found</p>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'agenda':
        return renderAgendaView();
      default:
        return renderMonthView();
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {notification.show && (
        <NotificationToast
          message={notification.message}
          onClose={hideNotification}
        />
      )}
      
      <div className="mt-24 p-2 sm:p-4 md:p-8">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Management</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <select
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-white border border-gray-300 rounded-lg p-1 w-full sm:w-auto">
                {['month', 'week', 'day', 'agenda'].map(view => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto ${
                      currentView === view
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {currentView !== 'agenda' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentView === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {currentView === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                {currentView === 'day' && formatDate(currentDate)}
              </h2>
              <button
                onClick={() => navigateDate(1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
          </div>
        )}

        {renderCurrentView()}
      </div>
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-[99vw] sm:w-[95vw] max-w-full sm:max-w-2xl p-2 sm:p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={closeBookingModal}
            >
              &times;
            </button>
            <DetailedBookingCard 
              booking={selectedBooking} 
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;