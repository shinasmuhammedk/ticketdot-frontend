import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import MyBookings from './pages/MyBookings';
import BookingSuccess from './pages/BookingSuccess';

import OperatorDashboard from './pages/operator/OperatorDashboard';
import CreateBus from './pages/operator/CreateBus';
import CreateRoute from './pages/operator/CreateRoute';
import CreateSchedule from './pages/operator/CreateSchedule';
import OperatorBookings from './pages/operator/OperatorBookings';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
                <Route path="/seat-selection" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/booking-success" element={<BookingSuccess />} />


                <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                <Route path="/operator/create-bus" element={<CreateBus />} />
                <Route path="/operator/create-route" element={<CreateRoute />} />
                <Route path="/operator/create-schedule" element={<CreateSchedule />} />
                <Route path="/operator/bookings" element={<OperatorBookings />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
