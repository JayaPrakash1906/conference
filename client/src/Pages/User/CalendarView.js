import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, Phone, Mail, Target, Plus, Trash2 } from 'lucide-react';
import Navbar from '../../components/UserNavbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const CalendarView = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [categoryMap, setCategoryMap] = useState({});
  
  // Booking form states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState(dayjs());
  
  const [formData, setFormData] = useState({
    name: '',
    meeting_name: '',
    start_time: '',
    end_time: '',
    meeting_purpose: '',
    contact_number: '',
    email: JSON.parse(localStorage.getItem('user'))?.email || '',
    team_category: '',
    team_sub_category: '',
    nirmaan_text: '',
    room_id: ''
  });
  
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://13.127.171.141:5000/api/');
        const cats = res.data;
        const map = {};
        (Array.isArray(cats) ? cats : []).forEach(cat => {
          map[cat.id] = cat.name;
        });
        setCategoryMap(map);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.error('Error fetching categories:', e);
        setCategoryMap({});
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch rooms for booking form
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://13.127.171.141:5000/api/get");
        let fetchedRooms = [];
        if (response.data && Array.isArray(response.data)) fetchedRooms = response.data;
        else if (response.data?.rows && Array.isArray(response.data.rows)) fetchedRooms = response.data.rows;
        else if (response.data?.data && Array.isArray(response.data.data)) fetchedRooms = response.data.data;
        setRooms(fetchedRooms);
      } catch {
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Fetch teams when category changes
  useEffect(() => {
    if (formData.team_category) {
      axios.get(`http://13.127.171.141:5000/api/category/${formData.team_category}`)
        .then(res => setTeams(Array.isArray(res.data) ? res.data : []))
        .catch(() => setTeams([]));
      setFormData(prev => ({ ...prev, team_sub_category: '' }));
    } else {
      setTeams([]);
      setFormData(prev => ({ ...prev, team_sub_category: '' }));
    }
  }, [formData.team_category]);

  const fetchBookings = async () => {
    try {
      // Fetch all bookings instead of just user's bookings
      const response = await axios.get(`http://13.127.171.141:5000/api/get_browseroom`);
      
      if (!response.data) {
        throw new Error('Invalid response format');
      }

      let bookingsData = [];
      if (response.data.rows) {
        bookingsData = response.data.rows;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else {
        bookingsData = [];
      }

      const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
      };

      const transformedBookings = bookingsData.map(booking => {
        const formattedTime = `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`;

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

        const rawDateKey = (booking.date || '').toString().slice(0, 10);
        
        // Determine display status based on creator role
        let displayStatus = booking.status || 'Pending';
        if (booking.creator_role === 'admin') {
          displayStatus = 'confirmed'; // Admin bookings always show as confirmed
        }
        
        return {
          id: booking.id,
          title: booking.meeting_name || 'Untitled Meeting',
          user: booking.name,
          status: displayStatus,
          room: booking.booked_room_name,
          location: `${booking.location || 'Location not specified'}`,
          date: new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
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
          rawDate: rawDateKey,
          creator_role: booking.creator_role || 'user'
        };
      });

      const sorted = transformedBookings.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.rawDate) - new Date(a.rawDate);
      });

      setBookings(sorted);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Unable to load bookings. Please try again later.");
      toast.error('Failed to load your bookings. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [categoryMap]);

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getBookingsForDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
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

  // Handle date click to open booking form
  const handleDateClick = (date) => {
    const today = dayjs();
    const maxBookingDate = dayjs().add(10, 'day');
    const clickedDate = dayjs(date);
    
    // Only allow booking for next 10 days from today
    if (clickedDate.isBefore(today, 'day') || clickedDate.isAfter(maxBookingDate, 'day')) {
      toast.error('You can only book rooms for the next 10 days from today.');
      return;
    }
    
    setSelectedDateForBooking(clickedDate);
    setIsBookingOpen(true);
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.meeting_name || !formData.start_time || !formData.end_time || 
        !formData.meeting_purpose || !formData.contact_number || !formData.email || 
        !formData.team_category || !formData.room_id) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.contact_number)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time.');
      return;
    }

    const selectedCategory = categories.find(cat => cat.id.toString() === formData.team_category);
    if (selectedCategory?.name === 'Nirmaan Teams' && !formData.nirmaan_text.trim()) {
      toast.error('Please enter your Nirmaan team name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = selectedDateForBooking.format('YYYY-MM-DD');
      
      let teamName;
      if (selectedCategory?.name === 'Nirmaan Teams') {
        teamName = formData.nirmaan_text;
      } else {
        const selectedTeam = teams.find(t => t.id.toString() === formData.team);
        teamName = selectedTeam ? selectedTeam.name : formData.team_sub_category;
      }

      const bookingData = {
        ...formData,
        date: formattedDate,
        start_time: formData.start_time,
        end_time: formData.end_time,
        team_sub_category: teamName,
        nirmaan_text: formData.nirmaan_text || ''
      };

      const response = await axios.post('http://13.127.171.141:5000/api/create_browseroom', bookingData);
      if (response.data) {
        toast.success('Room booked successfully!');
        setIsBookingOpen(false);
        setFormData({
          name: '', meeting_name: '', start_time: '', end_time: '', meeting_purpose: '', 
          contact_number: '', email: user?.email || '', team_category: '', team_sub_category: '', 
          nirmaan_text: '', room_id: ''
        });
        setSelectedDateForBooking(dayjs());
        // Refresh bookings list
        await fetchBookings();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.status) {
        toast.error(error.response.data.status);
      } else {
        toast.error('Failed to book room. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await axios.delete(`http://13.127.171.141:5000/api/delete_browseroom/${bookingId}?email=${user?.email}`);
      toast.success('Booking deleted successfully!');
      await fetchBookings(); // Refresh bookings
      setSelectedBooking(null); // Close modal if open
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking. Please try again.');
    }
  };

  // Check if date is bookable (next 10 days from today)
  const isDateBookable = (date) => {
    const today = dayjs();
    const maxBookingDate = dayjs().add(10, 'day');
    const checkDate = dayjs(date);
    return (checkDate.isAfter(today, 'day') || checkDate.isSame(today, 'day')) && 
           (checkDate.isBefore(maxBookingDate, 'day') || checkDate.isSame(maxBookingDate, 'day'));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const UserBookingCard = ({ booking }) => (
    <div className={`p-3 rounded-lg border-l-4 ${
      booking.status.toLowerCase() === 'confirmed' ? 'border-green-500 bg-green-50' :
      booking.status.toLowerCase() === 'pending' ? 'border-yellow-500 bg-yellow-50' :
      'border-red-500 bg-red-50'
    } mb-3`}> 
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">{booking.title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2" />
              {booking.time}
            </div>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-2" />
              {booking.room}
            </div>
            <div className="flex items-center">
              <Target className="w-3 h-3 mr-2" />
              <span className="truncate">
                {booking.team}
                {booking.subTeam && booking.subTeam.trim() !== '' ? ` - ${booking.subTeam}` : ''}
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-3 h-3 mr-2" />
              {booking.user}
            </div>
          </div>
          {booking.notes && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Purpose:</span> {booking.notes}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          {/* Only show delete button if this booking belongs to the current user */}
          {(booking.status.toLowerCase() === 'pending' || booking.status.toLowerCase() === 'confirmed') && 
           booking.email === user?.email && (
            <button
              onClick={() => handleDeleteBooking(booking.id)}
              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded text-xs transition-colors"
              title="Delete your booking"
            >
              <Trash2 className="w-3 h-3" />
              Delete
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
            const isBookable = isDateBookable(day);
            
            return (
              <div 
                key={index} 
                className={`min-h-24 p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''} ${
                  isCurrentMonth && isBookable ? 'cursor-pointer hover:bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (isCurrentMonth && isBookable) {
                    handleDateClick(day);
                  }
                }}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 
                  !isCurrentMonth ? 'text-gray-400' :
                  isBookable ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, expandedDays.has(day.toDateString()) ? dayBookings.length : 2).map(booking => (
                    <div
                      key={booking.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                        booking.status.toLowerCase() === 'confirmed' ? 'bg-green-200 text-green-800' :
                        booking.status.toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                      }}
                      title={booking.title}
                    >
                      {booking.title}
                    </div>
                  ))}
                  {dayBookings.length > 2 && !expandedDays.has(day.toDateString()) && (
                    <div 
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandedDay(day.toDateString());
                      }}
                    >
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                  {dayBookings.length > 2 && expandedDays.has(day.toDateString()) && (
                    <div 
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandedDay(day.toDateString());
                      }}
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
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getBookingsForDay = (date) => {
      return weekBookings.find(d => d.date.toDateString() === date.toDateString())?.bookings || [];
    };

    const calculateBookingPosition = (booking) => {
      const [startHour, startMinute] = booking.rawStartTime.split(':').map(Number);
      const [endHour, endMinute] = booking.rawEndTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const duration = endMinutes - startMinutes;
      
      // Position from top (in percentage)
      const topPercent = (startMinutes / (24 * 60)) * 100;
      const heightPercent = (duration / (24 * 60)) * 100;
      
      return {
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        duration: duration
      };
    };

    return (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-8 border-b">
          <div className="bg-gray-100 p-2 border-r"></div>
          {weekBookings.map(({ date }, idx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className={`text-center p-2 border-r last:border-r-0 font-medium ${isToday ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-100'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </div>
            );
          })}
        </div>
        <div className="min-w-[900px] grid grid-cols-8">
          <div className="flex flex-col border-r">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b text-xs text-gray-400 flex items-start justify-end pr-2 pt-1">
                {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </div>
            ))}
          </div>
          {weekBookings.map(({ date }, dayIdx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDay(date);
            
            return (
              <div key={dayIdx} className={`relative flex flex-col border-r last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}> 
                {/* Time grid background */}
                {hours.map(hour => (
                  <div key={hour} className="h-16 border-b"></div>
                ))}
                
                {/* Bookings positioned by actual time */}
                {dayBookings.map((booking) => {
                  const position = calculateBookingPosition(booking);
                  return (
                    <div
                      key={booking.id}
                      className={`absolute left-1 right-1 rounded shadow cursor-pointer px-2 py-1 overflow-hidden
                        ${booking.status.toLowerCase() === 'confirmed' ? 'bg-green-200 text-green-800 border-green-300' :
                          booking.status.toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800 border-yellow-300' :
                          'bg-red-200 text-red-800 border-red-300'}
                      `}
                      style={{
                        top: position.top,
                        height: position.height,
                        minHeight: '20px',
                        zIndex: 10
                      }}
                      title={`${booking.title} - ${booking.time}`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="text-xs font-medium truncate">
                        {booking.title}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {booking.time}
                      </div>
                      {booking.room && (
                        <div className="text-xs opacity-75 truncate">
                          {booking.room}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = getBookingsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const calculateBookingPosition = (booking) => {
      const [startHour, startMinute] = booking.rawStartTime.split(':').map(Number);
      const [endHour, endMinute] = booking.rawEndTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const duration = endMinutes - startMinutes;
      
      // Position from top (in percentage)
      const topPercent = (startMinutes / (24 * 60)) * 100;
      const heightPercent = (duration / (24 * 60)) * 100;
      
      return {
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        duration: duration
      };
    };

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-center sm:text-left">{formatDate(currentDate)}</h2>
        </div>
        <div className="flex">
          {/* Time column */}
          <div className="w-20 flex-shrink-0">
            <div className="h-16 border-b"></div>
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b text-xs text-gray-400 flex items-start justify-end pr-2 pt-1">
                {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </div>
            ))}
          </div>
          
          {/* Day column */}
          <div className="flex-1 relative">
            {/* Time grid background */}
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b"></div>
            ))}
            
            {/* Bookings positioned by actual time */}
            {dayBookings.length > 0 ? (
              dayBookings.map((booking) => {
                const position = calculateBookingPosition(booking);
                return (
                  <div
                    key={booking.id}
                    className={`absolute left-2 right-2 rounded shadow cursor-pointer px-3 py-2 overflow-hidden
                      ${booking.status.toLowerCase() === 'confirmed' ? 'bg-green-200 text-green-800 border-green-300' :
                        booking.status.toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800 border-yellow-300' :
                        'bg-red-200 text-red-800 border-red-300'}
                    `}
                    style={{
                      top: position.top,
                      height: position.height,
                      minHeight: '40px',
                      zIndex: 10
                    }}
                    title={`${booking.title} - ${booking.time}`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="font-medium truncate mb-1">
                      {booking.title}
                    </div>
                    <div className="text-sm opacity-75 truncate mb-1">
                      {booking.time}
                    </div>
                    {booking.room && (
                      <div className="text-sm opacity-75 truncate">
                        {booking.room}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bookings for this day</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedBookings = [...filteredBookings].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
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
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {bookings.map(booking => (
                <UserBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedBookings).length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found</p>
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
        <div className="mt-32 p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading calendar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="mt-32 p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-red-500">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="mt-20">
        <div className="mt-36 p-2 sm:p-4 md:p-8">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Room Calendar</h1>
            </div>
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
      </div>
      
      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-[99vw] sm:w-[95vw] max-w-full sm:max-w-2xl p-2 sm:p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={closeBookingModal}
            >
              &times;
            </button>
            <UserBookingCard booking={selectedBooking} />
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={(e) => { if (e.target === e.currentTarget) setIsBookingOpen(false); }}>
          <div className="bg-white rounded-lg shadow-lg w-[99vw] sm:w-[95vw] max-w-full sm:max-w-4xl p-2 sm:p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setIsBookingOpen(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-3">Book Room for {selectedDateForBooking.format('dddd, MMMM D, YYYY')}</h2>

            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Booking Window:</strong> You can only book rooms for the next 10 days from today.
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Meeting Name *</label>
                  <input 
                    type="text" 
                    name="meeting_name" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.meeting_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_name: e.target.value }))} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Date *</label>
                  <input 
                    type="date" 
                    name="date"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={selectedDateForBooking.format('YYYY-MM-DD')}
                    onChange={(e) => setSelectedDateForBooking(dayjs(e.target.value))}
                    min={dayjs().format('YYYY-MM-DD')}
                    max={dayjs().add(10, 'day').format('YYYY-MM-DD')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Room *</label>
                  <select 
                    name="room_id" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.room_id} 
                    onChange={(e) => setFormData(prev => ({ ...prev, room_id: e.target.value }))} 
                    required
                  >
                    <option value="" disabled>Select room...</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Start Time *</label>
                  <select 
                    name="start_time" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.start_time} 
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))} 
                    required
                  >
                    <option value="">Select start time</option>
                    {Array.from({ length: 24 }, (_, h) => h).flatMap(h => [0,15,30,45].map(m => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">End Time *</label>
                  <select 
                    name="end_time" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.end_time} 
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))} 
                    required
                  >
                    <option value="">Select end time</option>
                    {Array.from({ length: 24 }, (_, h) => h).flatMap(h => [0,15,30,45].map(m => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Contact Number *</label>
                  <input 
                    type="text" 
                    name="contact_number" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.contact_number} 
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))} 
                    placeholder="10-digit mobile number"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-left mb-1">Email ID *</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100" 
                    value={formData.email} 
                    readOnly
                    disabled
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-left mb-1">Meeting Purpose *</label>
                  <textarea 
                    name="meeting_purpose" 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                    value={formData.meeting_purpose} 
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_purpose: e.target.value }))} 
                    rows="3" 
                    required 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-left mb-1">Team/Company/Office/Clubs *</label>
                  <select 
                    name="team_category" 
                    value={formData.team_category} 
                    onChange={(e) => setFormData(prev => ({ ...prev, team_category: e.target.value, team_sub_category: '', team: '', nirmaan_text: '' }))} 
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {formData.team_category && teams.length > 0 && categories.find(cat => String(cat.id) === String(formData.team_category))?.name !== 'Nirmaan Teams' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-left mb-1">Team</label>
                    <select 
                      name="team" 
                      value={formData.team} 
                      onChange={(e) => {
                        const selectedTeam = teams.find(t => t.id.toString() === e.target.value);
                        setFormData(prev => ({ 
                          ...prev, 
                          team: e.target.value, 
                          team_sub_category: selectedTeam ? selectedTeam.name : '' 
                        }));
                      }} 
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select team...</option>
                      {teams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                    </select>
                  </div>
                )}
                {formData.team_category && categories.find(cat => String(cat.id) === String(formData.team_category))?.name === 'Nirmaan Teams' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-left mb-1">Team Name *</label>
                    <input 
                      type="text" 
                      name="nirmaan_text" 
                      placeholder="Enter your Nirmaan team name..." 
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.nirmaan_text} 
                      onChange={(e) => setFormData(prev => ({ ...prev, nirmaan_text: e.target.value }))} 
                      required 
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors" 
                  onClick={() => setIsBookingOpen(false)} 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;