import React from 'react';
import { useNavigate } from 'react-router-dom';
import Img1 from '../Assets/iitm logo.png';
import Img2 from '../Assets/oielogo.png';
import { FiLogOut } from 'react-icons/fi';
import UserImg from '../Assets/user.png';

const UserNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white text-black z-50 shadow-lg">
      {/* Top section with logos and user info */}
      <div className="flex items-center justify-between px-6 py-2 border-b-2">
        {/* Left - Logos */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/user/browse_room')}
        >
          <img src={Img1} className="h-12 w-auto ml-4" alt="IITM Logo" />
          <img src={Img2} className="h-16 w-auto ml-5" alt="OIE Logo" />
        </div>

        {/* Right - User and Logout */}
        <div className="flex items-center space-x-4 mr-6">
          <img
            src={UserImg}
            alt="User"
            className="h-10 w-10 rounded-full object-cover border"
          />
          <span className="hidden md:inline-block text-sm border rounded-lg px-2">
            {user?.name || 'User'}
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
      <div className="flex items-center space-x-4 ml-6 py-2">
        <a
  href="/user/browse_room"
  className={`transition hover:text-blue-500 ${
    window.location.pathname === '/user/browse_room'
      ? 'text-blue-500 font-semibold'
      : 'text-gray-600'
  }`}
>
  Browse Rooms
</a>

<a
  href="/user/my_booking"
  className={`transition hover:text-blue-500 ${
    window.location.pathname === '/user/my_booking'
      ? 'text-blue-500 font-semibold'
      : 'text-gray-600'
  }`}
>
  My Bookings
</a>

      </div>
    </div>
  );
};

export default UserNavbar;
