import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import PNR from './Components/User/PNR/pnrstatus';
import PNRhome from './PNR/pnrstatus'
import Home from './Home';
import Login from "./Components/User/Credentials/login";
import Register from './Components/User/Credentials/register';
import Booking from "./Components/User/Bookings/bookticket";
import Profile from './Components/User/Profile/profile';
import Password from './Components/User/Credentials/password';
import TrainSearch from './Components/User/Trains/trains'
import TrainSchedule from './Components/User/Schedule/trainschedule';
import Timetable from './Components/User/Timetable/timetablesearch';
import TrainPreview from './Components/User/TrainPev/trainpreview';
import Confirm from './Components/User/BookingConfirm/confirmation';
import Success from './Components/User/success/showsuccess';
import Bookings from './Components/User/BookingHistory/bookingHistory';
import AdminRegister from './Components/admin/Credentials/register';
import AdminLogin from './Components/admin/Credentials/login';
import Dashboard from './Components/admin/Dasboardmenu/dashboard';
import AddTrain from './Components/admin/AddTrain/addtrain';
import UpdateTrain from './Components/admin/UpdateTrain/updatetrain';
import DeleteTrain from './Components/admin/DeleteTrain/deletetrain';
import TTE from './Components/admin/tte/tte';
import Tickets from './Components/tte/Bookings/allbookings';
import TTELogin from './Components/tte/login/login';
import TTEprotect from './Components/tte/ProtectedRoute'
import { Bounce } from 'react-toastify';
function App() {

  const ProtectedRouteAdmin = ({ children }) => {
    const isAuthenticated = sessionStorage.getItem("userId");
    return isAuthenticated ? children : <Navigate to="/admin" />;
  };


  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true'); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); 
  };


  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
          <Route path="/" element={<Home />} />
          <Route path="/pnr" element={<PNRhome />} />
          <Route path="/pnr-status" element={<PNR />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<Password />} />
          <Route path="/train-search" element={<TrainSearch />} />
          <Route path="/schedule/:trainNumber" element={<TrainSchedule />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/passenger" element={<TrainPreview />} />
          <Route path="/confirmation" element={<Confirm />} />
          <Route path="/success" element={<Success />} />
          <Route path="/booking-history" element={<Bookings />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRouteAdmin><Dashboard /></ProtectedRouteAdmin>} />
          <Route path="/admin/add-train" element={<ProtectedRouteAdmin><AddTrain /></ProtectedRouteAdmin>} />
          <Route path="/admin/update-train" element={<ProtectedRouteAdmin><UpdateTrain /></ProtectedRouteAdmin>} />
          <Route path="/admin/delete-train" element={<ProtectedRouteAdmin><DeleteTrain /></ProtectedRouteAdmin>} />
          <Route path="/admin/tte" element={<ProtectedRouteAdmin><TTE /></ProtectedRouteAdmin>} />
          <Route path="/tte" element={<TTELogin onLogin={handleLogin} />} />
          <Route path="/tte/view-tickets" element={<TTEprotect isAuthenticated={isAuthenticated}><Tickets onLogout={handleLogout}/></TTEprotect> }/>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          theme="colored"
          transition={Bounce}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
