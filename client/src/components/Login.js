import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import logo from "../Assets/oielogo.png";
import logo1 from "../Assets/iitm logo.png";
import backgroundImage from "../Assets/DSC.JPG";
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const lastActivityTime = parseInt(localStorage.getItem('lastActivityTime') || '0');
    const currentTime = new Date().getTime();
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

    if (user && lastActivityTime && currentTime - lastActivityTime < SESSION_TIMEOUT) {
      // Valid session exists
      if (user.role === 'admin') {
        navigate('/admin/room');
      } else {
        navigate('/user/browse_room');
      }
    } else if (user) {
      // Session expired
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivityTime');
      toast.info('Previous session expired. Please login again.');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://13.127.171.141:5000/api/login', formData);
      
      if (response.data.user) {
        // Initialize session
        const currentTime = new Date().getTime();
        localStorage.setItem('lastActivityTime', currentTime.toString());
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Show success message
        toast.success('Login successful!');
        
        navigate('/admin/room'); // or navigate('/user/browse_room');
      }
    } catch (error) {
      console.error('Login error:', error, error.response);
      let msg = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if session is valid
  console.log(localStorage.getItem('lastActivityTime'))

  return (
    <div className="flex h-screen">
      <div className="w-1/2 hidden md:block">
        <img
          src={backgroundImage}
          alt="Login Visual"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-96"
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <img src={logo1} alt="Logo 1" className="h-16" />
            <img src={logo} alt="Logo 2" className="h-24" />
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Login
          </h2>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="mt-4 text-center text-gray-600">
            No account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
       