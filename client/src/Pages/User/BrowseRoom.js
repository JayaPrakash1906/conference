import React, { useState, useEffect } from "react";
import Navbar from "../../components/UserNavbar";
import axios from "axios";
import img1 from "../../Assets/pexels-photo-260928.jpeg";
import { FaLocationDot, FaPeopleGroup } from "react-icons/fa6";
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BrowseRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("Any capacity");
  const [equipmentFilters, setEquipmentFilters] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamSubcategories, setTeamSubcategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [teamsByCategory, setTeamsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    meeting_name: '',
    start_time: '',
    end_time: '',
    meeting_purpose: '',
    contact_number: '',
    email: JSON.parse(localStorage.getItem('user'))?.email || '',
    team_category: '', // No default, must select
    team_sub_category: '',
    team: '' // <-- add this
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://13.127.171.141:5000/api/get");
        let fetchedRooms = response.data.rows;
        // Custom room order
        const roomOrder = [
          "Conference Room 101",
          "Conference Room 102",
          "Meeting Room 1",
          "Meeting Room 2"
        ];
        fetchedRooms.sort((a, b) => {
          const indexA = roomOrder.indexOf(a.name);
          const indexB = roomOrder.indexOf(b.name);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load rooms. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };
    fetchRooms();

    // Fetch teams for dropdowns
    const fetchTeams = async () => {
      try {
        const response = await axios.get("http://13.127.171.141:5000/api/teams");
        setTeams(response.data);
      } catch (error) {
        setTeams([]);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    // Fetch categories on mount
    axios.get('http://13.127.171.141:5000/api/')
      .then(res => {
        setCategories(Array.isArray(res.data) ? res.data : []);
        // Fetch teams for all categories
        const fetchAllTeams = async () => {
          const teamsMap = {};
          await Promise.all((Array.isArray(res.data) ? res.data : []).map(async (cat) => {
            const tRes = await axios.get(`http://13.127.171.141:5000/api/category/${cat.id}`);
            const tData = tRes.data;
            teamsMap[cat.id] = Array.isArray(tData) ? tData : [];
          }));
          setTeamsByCategory(teamsMap);
        };
        fetchAllTeams();
      })
      .catch(() => setCategories([]));
  }, []);

  // Fetch teams for selected category, but do not show in form
  useEffect(() => {
    if (formData.team_category) {
      axios.get(`http://13.127.171.141:5000/api/category/${formData.team_category}`)
        .then(res => setTeams(Array.isArray(res.data) ? res.data : []))
        .catch(() => setTeams([]));
    } else {
      setTeams([]);
    }
  }, [formData.team_category]);

  useEffect(() => {
    if (formData.team_category) {
      axios.get(`http://13.127.171.141:5000/api/subcategories?category_id=${formData.team_category}`)
        .then(res => {
          setSubcategories(res.data);
          console.log('Fetched subcategories:', res.data);
        })
        .catch(() => setSubcategories([]));
      setFormData(prev => ({ ...prev, team_sub_category: '' }));
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, team_sub_category: '' }));
    }
  }, [formData.team_category]);

  // Fetch subcategories when team changes
  useEffect(() => {
    if (formData.team) {
      axios.get(`http://13.127.171.141:5000/api/team/${formData.team}/subcategories`)
        .then(res => setTeamSubcategories(Array.isArray(res.data) ? res.data : []))
        .catch(() => setTeamSubcategories([]));
      setFormData(prev => ({ ...prev, team_sub_category: '' }));
    } else {
      setTeamSubcategories([]);
      setFormData(prev => ({ ...prev, team_sub_category: '' }));
    }
  }, [formData.team]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'team_category') {
      setFormData(prev => ({
        ...prev,
        team_sub_category: '',
        team: '' // reset team when category changes
      }));
    }
    if (name === 'team') {
      // Get team name from the selected team ID
      const selectedTeam = teams.find(t => t.id.toString() === value);
      if (selectedTeam) {
        setFormData(prev => ({
          ...prev,
          team_sub_category: selectedTeam.name
        }));
      }
    }
  };

  const generateTimeOptions = () => { 
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    
    return `${endHours}:${endMinutes}`;
  };

  const handleStartTimeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      start_time: value
    }));
  };

  const closeModal = () => {
    setIsBookingOpen(false);
    setSelectedRoom(null);
    setFormData({
      name: '',
      meeting_name: '',
      start_time: '',
      end_time: '',
      meeting_purpose: '',
      contact_number: '',
      email: JSON.parse(localStorage.getItem('user'))?.email || '',
      team_category: '',
      team_sub_category: '',
      team: ''
    });
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isBookingOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isBookingOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for past date and time
    const now = dayjs();
    const [startHour, startMinute] = formData.start_time.split(':');
    const selectedStartDateTime = selectedDate
      .hour(parseInt(startHour))
      .minute(parseInt(startMinute))
      .second(0);

    if (selectedStartDateTime.isBefore(now)) {
      toast.error("You cannot book a room for a past date or time.");
      return;
    }

    // Validation for end time to be after start time
    if (formData.start_time >= formData.end_time) {
      toast.error("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date and time properly
      const formattedDate = selectedDate.format('YYYY-MM-DD');
      
      // Get team name from selected team ID
      const selectedTeam = teams.find(t => t.id.toString() === formData.team);
      const teamName = selectedTeam ? selectedTeam.name : formData.team_sub_category;
      
      const bookingData = {
        ...formData,
        date: formattedDate,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_id: selectedRoom.id,
        team_sub_category: teamName
      };

      const response = await axios.post("http://13.127.171.141:5000/api/create_browseroom", bookingData);
      
      if (response.data) {
        toast.success("Room booked successfully!", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
        closeModal();
      }
    } catch (error) {
      console.error("Error booking room:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else if (error.response?.data?.status) {
        toast.error(error.response.data.status, {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("Failed to book room. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEquipmentFilter = (equipment) => {
    setEquipmentFilters((prev) =>
      prev.includes(equipment)
        ? prev.filter((item) => item !== equipment)
        : [...prev, equipment]
    );
  };

  const handleDeleteTeam = (id) => {
    axios.delete(`/api/teams/${id}`)
      .then(() => setTeams(teams.filter(t => t.id !== id)));
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCapacity = true;
    if (capacityFilter !== "Any capacity") {
      const [min, max] = capacityFilter.split("-").map(Number);
      matchesCapacity = room.capacity >= min && room.capacity <= max;
    }

    const matchesEquipment = equipmentFilters.every((filter) =>
      room.equipment.includes(filter)
    );

    return matchesSearch && matchesCapacity && matchesEquipment;
  });

  return (
    <div>
      <Navbar />
      <div className="mt-32 p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-dmsans mb-2 sm:mb-4">Room Management</h1>
        
        {isBookingOpen && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={handleBackdropClick}>
            <div className="bg-white border shadow-lg rounded-xl p-2 sm:p-6 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Book {selectedRoom.name}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected Date:</strong> {selectedDate.format('dddd, MMMM D, YYYY')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-left">
                      Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Enter your name" 
                      className="w-full border px-3 py-2 rounded-md" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-left">
                      Meeting Name
                    </label>
                    <input 
                      type="text" 
                      name="meeting_name"
                      placeholder="Enter meeting name" 
                      className="w-full border px-3 py-2 rounded-md" 
                      value={formData.meeting_name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-left">
                      Start Time
                    </label>
                    <select
                      name="start_time"
                      className="w-full border px-3 py-2 rounded-md"
                      value={formData.start_time}
                      onChange={handleStartTimeChange}
                      required
                    >
                      <option value="">Select start time</option>
                      {generateTimeOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-left">
                      Date
                    </label>
                    <input 
                      type="date" 
                      name="date"
                      className="w-full border px-3 py-2 rounded-md" 
                      value={selectedDate.format('YYYY-MM-DD')}
                      onChange={(e) => setSelectedDate(dayjs(e.target.value))}
                      min={dayjs().format('YYYY-MM-DD')}
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-left">
                      End Time
                    </label>
                    <select
                      name="end_time"
                      className="w-full border px-3 py-2 rounded-md"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select end time</option>
                      {generateTimeOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-left">
                      Meeting Purpose
                    </label>
                    <textarea 
                      name="meeting_purpose"
                      placeholder="Enter meeting purpose" 
                      className="w-full border px-3 py-2 rounded-md rows-3 resize-none" 
                      value={formData.meeting_purpose}
                      onChange={handleInputChange}
                      rows="3"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-left">
                      Contact Number
                    </label>
                    <input 
                      type="text" 
                      name="contact_number"
                      placeholder="Enter contact number" 
                      className="w-full border px-3 py-2 rounded-md" 
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-left">
                      Email ID
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      className="w-full border px-3 py-2 rounded-md bg-gray-100" 
                      value={formData.email}
                      readOnly 
                      disabled
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-left">
                      Team/Company/Office/Clubs
                    </label>
                    <select
                      name="team_category"
                      value={formData.team_category}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded-md"
                      required
                    >
                      <option value="" disabled>Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Team dropdown: Only show if a category is selected and there are teams */}
                  {formData.team_category && teams.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-left mt-2">
                        Team
                      </label>
                      <select
                        name="team"
                        value={formData.team}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-md"
                        required
                      >
                        <option value="">Select team...</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* {formData.team && teamSubcategories.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-left mt-2">
                        Team Subcategory
                      </label>
                      <select
                        name="team_sub_category"
                        value={formData.team_sub_category}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-md"
                        required
                      >
                        <option value="">Select subcategory...</option>
                        {teamSubcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )} */}
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-2 sm:p-4 w-full max-w-full sm:max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search rooms by name or location..."
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="w-full md:w-48 px-3 sm:px-4 py-2 border border-gray-300 rounded focus:outline-none text-sm sm:text-base"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option>Any capacity</option>
              <option>1-5</option>
              <option>6-10</option>
              <option>11-20</option>
              <option>20-30</option>
            </select>
          </div>

          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm font-medium text-gray-700 text-left mb-1 sm:mb-2">
              Equipment:
            </p>
            <div className="flex flex-wrap gap-2">
              {["Projector", "Video Conference", "Whiteboard", "LCD Screen"].map(
                (item) => (
                  <button
                    key={item}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full transition ${
                      equipmentFilters.includes(item)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-blue-900 hover:bg-blue-100"
                    }`}
                    onClick={() => toggleEquipmentFilter(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 lg:ml-0">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="w-full max-w-full sm:max-w-sm rounded-xl overflow-hidden shadow-lg bg-white flex flex-col h-full"
            >
              <img
                className="w-full h-40 sm:h-48 object-cover"
                src={room.image || img1}
                alt={room.name}
              />
              <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between min-h-[260px] sm:min-h-[320px]">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-1 truncate">{room.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {room.description}
                  </p>

                  <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-1">
                    <span className="mr-2">
                      <FaPeopleGroup />
                    </span>
                    Capacity: {room.capacity} people
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-2 sm:mb-4">
                    <span className="mr-2">
                      <FaLocationDot />
                    </span>
                    {room.location}, {room.floor}
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                    {room.equipment.split(", ").map((item) => (
                      <span
                        key={item}
                        className="bg-gray-100 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full truncate"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-auto text-sm sm:text-base"
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsBookingOpen(true);
                  }}
                >
                  Book this room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseRoom;