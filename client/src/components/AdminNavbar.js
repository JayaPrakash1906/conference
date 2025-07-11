import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Img1 from '../Assets/iitm logo.png';
import Img2 from '../Assets/oielogo.png';
import { FiLogOut, FiUser } from 'react-icons/fi';
import UserImg from '../Assets/admin.jpg';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white text-black z-50 shadow-lg">
      {/* Top section */}
      <div className="flex items-center justify-between px-6 py-2 border-b-2">
        {/* Left - Logos */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/admin/room')}
        >
          <img src={Img1} className="h-12 w-auto ml-4" alt="IITM Logo" />
          <img src={Img2} className="h-16 w-auto ml-5" alt="OIE Logo" />
        </div>

        {/* Right - User Info */}
        <div className="flex items-center space-x-4 mr-6">
          <a href="/admin/register" className="text-blue-600 hover:underline font-medium">Register User</a>
          <img
            src={UserImg}
            alt="User"
            className="h-10 w-10 rounded-full object-cover border"
          />
          <span className="text-sm border rounded-lg px-2">
            {user?.name || 'Admin'}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 hover:text-red-600 transition"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-4 ml-6 mt-2 pb-2">
          <a href="/admin/room" className={`transition hover:text-blue-500 ${ location.pathname === '/admin/room'? 'text-blue-500 font-semibold': 'text-gray-600'}`}>
            Room Management 
          </a>

          <a href="/admin/book" className={`transition hover:text-blue-500 ${ location.pathname === '/admin/book'? 'text-blue-500 font-semibold': 'text-gray-600' }`}>
            Booking Management
          </a>

          {/* New Teams Management tab */}
          <a href="/admin/teams-management" className={`transition hover:text-blue-500 ${ location.pathname === '/admin/teams-management'? 'text-blue-500 font-semibold': 'text-gray-600' }`}>
            Teams Management
          </a>
      </div>
    </div>
  );
};

export default AdminNavbar;
