import React, { useEffect, useState } from "react";
import Navbar from "../../components/AdminNavbar";
import axios from "axios";
import img1 from "../../Assets/admin.jpg"; // Fallback image
import { Pencil, Trash2, Upload } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    location: "",
    floor: "",
    capacity: "",
    equipment: "",
    description: "",
    image: "",
  });

  // Custom room order
  const roomOrder = [
    "Conference Room 101",
    "Conference Room 102",
    "Meeting Room 1",
    "Meeting Room 2"
  ];

  // Fetch rooms from the backend
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://13.127.171.141:5000/api/get");
      console.log("Fetch response:", response.data); // Debug log
      
      let fetchedRooms = [];
      if (response.data && Array.isArray(response.data)) {
        fetchedRooms = response.data;
      } else if (response.data && response.data.rows && Array.isArray(response.data.rows)) {
        fetchedRooms = response.data.rows;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        fetchedRooms = response.data.data;
      } else {
        console.error("Unexpected response structure:", response.data);
        fetchedRooms = [];
      }
      // Sort rooms according to the custom order
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
      toast.error('Error fetching rooms. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      });
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        setLoading(true);
        await axios.delete(`http://13.127.171.141:5000/api/delete/${id}`);
        toast.success('Room deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        // Refresh the rooms list after successful deletion
        await fetchRooms();
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error(error.response?.data?.message || 'Error deleting room. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (room) => {
    setFormData({
      id: room.id,
      name: room.name || "",
      location: room.location || "",
      floor: room.floor || "",
      capacity: room.capacity || "",
      equipment: room.equipment || "",
      description: room.description || "",
      image: room.image || "",
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setFormData({
      id: null,
      name: "",
      location: "",
      floor: "",
      capacity: "",
      equipment: "",
      description: "",
      image: "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.floor.trim()) {
      toast.error('Floor is required');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      toast.error('Valid capacity is required');
      return;
    }

    try {
      setLoading(true);
      
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('location', formData.location.trim());
      form.append('floor', formData.floor.trim());
      form.append('capacity', parseInt(formData.capacity));
      form.append('equipment', formData.equipment.trim());
      form.append('description', formData.description.trim());
      if (formData.image && typeof formData.image !== 'string') {
        form.append('image', formData.image);
      } else if (formData.image && typeof formData.image === 'string') {
        form.append('image', formData.image);
      }

      console.log("Data to send:", form); // Debug log

      let response;
      if (formData.id) {
        // Update existing room
        console.log("Updating room with ID:", formData.id);
        response = await axios.put(
          `http://13.127.171.141:5000/api/update/${formData.id}`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        console.log("Update response:", response.data); // Debug log
        
        toast.success('Room updated successfully! 🎉', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Create new room
        console.log("Creating new room");
        response = await axios.post(
          "http://13.127.171.141:5000/api/create",
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        console.log("Create response:", response.data); // Debug log
        
        toast.success('Room created successfully! 🎉', {
          position: "top-right",
          autoClose: 3000,
        });
      }

      // Close form and reset
      setShowForm(false);
      setFormData({
        id: null,
        name: "",
        location: "",
        floor: "",
        capacity: "",
        equipment: "",
        description: "",
        image: "",
      });

      // Refresh the rooms list
      await fetchRooms();

    } catch (error) {
      console.error("Error saving room:", error);
      console.error("Error response:", error.response?.data); // Debug log
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          `Error ${formData.id ? 'updating' : 'creating'} room. Please try again.`;
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = img1; // Use fallback image if database image fails to load
  };

  // Function to get the image source
  const getImageSource = (room) => {
    if (room.image && room.image.trim() !== "") {
      if (room.image.startsWith("/uploads")) {
        return `http://13.127.171.141:5000${room.image}`;
      }
      return room.image;
    }
    return img1;
  };

  return (
    <div>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="mt-36 p-2 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-dmsans">Room Management</h1>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            + Add Room
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading...</p>
          </div>
        )}

        {/* Room Cards */}
        <div className="space-y-4">
          {rooms.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No rooms found. Click "Add Room" to create your first room.
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-6 hover:shadow-md transition-shadow"
              >
                <img
                  src={getImageSource(room)}
                  alt={room.name}
                  className="w-full sm:w-60 h-40 object-cover rounded-lg mb-3 sm:mb-0"
                  onError={handleImageError}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 truncate">{room.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8 mb-2 sm:mb-3">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Location</div>
                      <div className="text-gray-900 text-sm sm:text-base">{room.location}, {room.floor}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Capacity</div>
                      <div className="text-gray-900 text-sm sm:text-base">{room.capacity} people</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Equipment</div>
                      <div className="text-gray-900 text-sm sm:text-base break-words">{room.equipment}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3">{room.description}</p>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      disabled={loading}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto"
                    >
                      <Pencil size={16} className="mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      disabled={loading}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 w-full sm:w-auto"
                    >
                      <Trash2 size={16} className="mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-3 sm:p-6 rounded-lg w-[98%] sm:w-[90%] max-w-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                {formData.id ? "Edit Room" : "Add New Room"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter room name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Floor *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Floor"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Building"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Room Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData({ ...formData, image: file });
                        }
                      }}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    {formData.image && typeof formData.image !== 'string' && (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="mt-2 w-32 h-20 object-cover rounded"
                      />
                    )}
                    {formData.image && typeof formData.image === 'string' && formData.image !== '' && (
                      <img
                        src={formData.image}
                        alt="Current"
                        className="mt-2 w-32 h-20 object-cover rounded"
                      />
                    )}
                    <small className="text-gray-500">
                      Upload a new image to replace the current one
                    </small>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Room description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Equipment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Projector",
                      "Whiteboard",
                      "Teleconference",
                      "Video Conference",
                      "LCD Screen",
                      "HDMI Connectivity",
                    ].map((item) => (
                      <label
                        key={item}
                        className="inline-flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.equipment.includes(item)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const equipmentArray = formData.equipment
                              ? formData.equipment.split(", ").filter(Boolean)
                              : [];
                            const updatedEquipment = checked
                              ? [...equipmentArray, item]
                              : equipmentArray.filter((i) => i !== item);
                            setFormData({
                              ...formData,
                              equipment: updatedEquipment.join(", "),
                            });
                          }}
                          disabled={loading}
                        />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;