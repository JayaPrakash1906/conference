import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

const SessionManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const resetTimeout = () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Get the current timestamp and save it
      const currentTime = new Date().getTime();
      localStorage.setItem('lastActivityTime', currentTime.toString());

      // Set new timeout
      timeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    };

    const handleSessionTimeout = () => {
      const lastActivityTime = parseInt(localStorage.getItem('lastActivityTime') || '0');
      const currentTime = new Date().getTime();
      
      if (currentTime - lastActivityTime >= SESSION_TIMEOUT) {
        // Clear user data
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivityTime');
        
        // Show timeout message
        toast.info('Session expired. Please login again.');
        
        // Redirect to login
        navigate('/');
      }
    };

    const handleActivity = () => {
      const user = localStorage.getItem('user');
      if (user) {
        resetTimeout();
      }
    };

    // Initialize session timeout
    const user = localStorage.getItem('user');
    if (user) {
      resetTimeout();
      
      // Add event listeners for user activity
      ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
    }

    // Check session status periodically
    const intervalId = setInterval(() => {
      const user = localStorage.getItem('user');
      if (user) {
        handleSessionTimeout();
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [navigate]);

  return null;
};

export default SessionManager; 