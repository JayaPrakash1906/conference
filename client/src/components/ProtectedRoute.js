import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User's role is not authorized, redirect to appropriate dashboard
    return <Navigate to={user.role === 'admin' ? '/admin/room' : '/user/browse_room'} replace />;
  }

  return children;
};

export default ProtectedRoute; 