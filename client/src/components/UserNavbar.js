import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Img1 from '../Assets/iitm logo.png';
import Img2 from '../Assets/oielogo.png';
import { FiLogOut } from 'react-icons/fi';
import UserImg from '../Assets/user.png';

const UserNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white text-black z-50 shadow-lg">
      {/* Top section with logos and user info */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2 border-b-2">
        {/* Left - Logos */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/user/browse_room')}
        >
          <img src={Img1} className="h-10 w-auto ml-2 md:h-12 md:ml-4" alt="IITM Logo" />
          <img src={Img2} className="h-12 w-auto ml-3 md:h-16 md:ml-5" alt="OIE Logo" />
        </div>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center px-2 py-1 border rounded text-gray-700 border-gray-400 hover:text-blue-600 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right - User and Logout (hidden on small screens) */}
        <div className="hidden md:flex items-center space-x-4 mr-6">
          <img
            src={UserImg}
            alt="User"
            className="h-10 w-10 rounded-full object-cover border"
          />
          <span className="text-sm border rounded-lg px-2">
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

      {/* Navigation Links (desktop) */}
      <div className="hidden md:flex items-center space-x-4 ml-6 py-2">
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <a
              href="/user/browse_room"
              className={`transition hover:text-blue-500 ${
                window.location.pathname === '/user/browse_room'
                  ? 'text-blue-500 font-semibold'
                  : 'text-gray-600'
              }`}
              onClick={() => setMenuOpen(false)}
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
              onClick={() => setMenuOpen(false)}
            >
              My Bookings
            </a>
            <div className="border-t my-2"></div>
            <div className="flex items-center justify-between w-full mt-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={UserImg}
                  alt="User"
                  className="h-8 w-8 rounded-full object-cover border"
                />
                <span className="text-sm font-medium truncate max-w-[100px]">{user?.name || 'User'}</span>
              </div>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center justify-center hover:text-red-600 transition px-3 py-1 border rounded text-sm"
                aria-label="Logout"
              >
                <FiLogOut className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNavbar;
