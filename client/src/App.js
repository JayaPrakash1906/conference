import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import BookingManagement from "./Pages/Admin/BookingManagement"
import RoomManagement from "./Pages/Admin/RoomManagement"
import Register from "./Pages/Admin/Register"
import BrowseRoom from './Pages/User/BrowseRoom';
import MyBooking from './Pages/User/MyBooking';
import ProtectedRoute from './components/ProtectedRoute';
import SessionManager from './components/SessionManager';
import AdminTeamsManagement from './Pages/Admin/AdminTeamsManagement';
// import CategoryManagement from './Pages/Admin/CategoryManagement';
// import AdminTeams from './Pages/Admin/AdminTeams';
// import AdminTeamManager from './Pages/Admin/AdminTeamManager';
// import AdminCategoryManager from './Pages/Admin/AdminCategoryManager';

function App() {
  return (
    <div className="App dm-sans">
      {/* <Home /> */}
      <BrowserRouter>
        <SessionManager />
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
          limit={3}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/book" element={<ProtectedRoute allowedRoles={['admin']}><BookingManagement /></ProtectedRoute>}/>
          <Route path="/admin/room" element={<ProtectedRoute allowedRoles={['admin']}><RoomManagement /></ProtectedRoute>}/>
          <Route path="/admin/register" element={<ProtectedRoute allowedRoles={['admin']}><Register /></ProtectedRoute>}/>
          <Route path="/admin/teams-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeamsManagement /></ProtectedRoute>}/>
          {/* <Route path="/admin/teams" element={<ProtectedRoute allowedRoles={['admin']}><TeamManagement /></ProtectedRoute>}/> */}
          {/* <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoryManagement /></ProtectedRoute>}/> */}
          {/* <Route path="/admin/teams" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeams /></ProtectedRoute>}/> */}
          {/* <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminCategoryManager /></ProtectedRoute>} /> */}
          <Route path="/user/browse_room" element={<ProtectedRoute allowedRoles={['user']}><BrowseRoom /></ProtectedRoute>}/>
          <Route path="/user/my_booking" element={<ProtectedRoute allowedRoles={['user']}><MyBooking /></ProtectedRoute>}/>
          <Route path="*" element={ <ProtectedRoute allowedRoles={['admin', 'user']}>{({ user }) => (<Navigate to={user.role === 'admin' ? '/admin/room' : '/user/browse_room'}replace/>)}</ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
        {/* <SideBar /> */}
    </div>
  );
}

export default App;
