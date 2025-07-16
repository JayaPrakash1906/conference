import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRandom, FaTrash, FaUsers, FaUserPlus } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const API_BASE = 'http://13.127.171.141:5000/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' // No default, must select
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'users'

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) {
        setUsersError('Failed to fetch users: ' + response.status + ' ' + response.statusText);
        setUsers([]);
        return;
      }
      const data = await response.json();
      console.log('Fetched users:', data);
      if (!data.users || !Array.isArray(data.users)) {
        setUsersError('Unexpected response format from server.');
        setUsers([]);
        return;
      }
      // Exclude current user
      const filtered = data.users.filter(u => u.id !== currentUser?.id);
      setUsers(filtered);
    } catch (error) {
      setUsersError('Network or server error: ' + error.message);
      setUsers([]);
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setFormData(prevState => ({
      ...prevState,
      password: password,
      confirmPassword: password
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsSubmitting(true);
    try {
      // First check if server is running
      try {
        const testResponse = await fetch(`${API_BASE}/test`);
        if (!testResponse.ok) {
          throw new Error('Server is not responding properly');
        }
      } catch (error) {
        toast.error('Cannot connect to server. Please make sure the server is running.');
        setIsSubmitting(false);
        return;
      }
      // Proceed with registration
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Registration successful! Check your email for login credentials.');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        });
        setActiveTab('users'); // Switch to users tab after registration
      } else {
        const errorMessage = data.message || 'Registration failed';
        toast.error(errorMessage);
        if (response.status === 404) {
          toast.error('Registration service is not available. Please contact support.');
        }
      }
    } catch (error) {
      toast.error('Failed to connect to server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="mt-24 max-w-full sm:max-w-3xl mx-auto p-2 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaUserPlus /> Register New User
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaUsers /> All Users
          </button>
        </div>

        {/* Register User Form */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-full sm:max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-blue-700">Register New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10 text-sm sm:text-base"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-2 text-gray-500 hover:text-blue-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10 text-sm sm:text-base"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-2 top-2 text-gray-500 hover:text-blue-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
                >
                  <FaRandom /> Generate Password
                </button>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm w-full sm:w-auto"
                  required
                >
                  <option value="" disabled>Select role...</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register User'}
              </button>
            </form>
          </div>
        )}

        {/* All Users List */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-8 max-w-full sm:max-w-3xl mx-auto overflow-x-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-700 flex items-center gap-2"><FaUsers /> All Users</h2>
            {loadingUsers ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : usersError ? (
              <div className="text-center py-8 text-red-500">{usersError}</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No users found.</div>
            ) : (
              <table className="w-full min-w-[600px] border-separate border-spacing-0 rounded-2xl overflow-hidden shadow bg-white text-xs sm:text-base">
                <thead className="bg-gradient-to-r from-blue-100 to-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 sm:px-3 py-2 text-left font-semibold text-blue-900 rounded-tl-2xl">#</th>
                    <th className="px-2 sm:px-3 py-2 text-left font-semibold text-blue-900">Name</th>
                    <th className="px-2 sm:px-3 py-2 text-center font-semibold text-blue-900">Email</th>
                    <th className="px-2 sm:px-3 py-2 text-center font-semibold text-blue-900">Role</th>
                    <th className="px-2 sm:px-3 py-2 text-center font-semibold text-blue-900 rounded-tr-2xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                      <td className="px-2 sm:px-3 py-2 align-middle text-gray-700 font-semibold">{idx + 1}</td>
                      <td className="px-2 sm:px-3 py-2 text-left font-medium text-gray-900">{user.name}</td>
                      <td className="px-2 sm:px-3 py-2 text-left text-gray-700">{user.email}</td>
                      <td className="px-2 sm:px-3 py-2 align-middle">
                        {user.role === 'admin' ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold bg-yellow-200 text-yellow-900 rounded-full border border-yellow-300">Admin</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold bg-blue-200 text-blue-900 rounded-full border border-blue-300">User</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center align-middle">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-white bg-red-500 hover:bg-red-700 p-2 rounded-full transition"
                          title="Delete user"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register; 