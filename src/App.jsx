import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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

import MyBuses from './pages/operator/MyBuses';
import TicketDetails from './pages/TicketDetails';
import MyRoutes from './pages/operator/MyRoutes';
import MySchedules from './pages/operator/MySchedules';
import OperatorReviews from './pages/operator/OperatorReviews';
import Profile from './pages/Profile';
import LiveTracking from './pages/LiveTracking';



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Passenger Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <SearchResults />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seat-selection"
                    element={
                        <ProtectedRoute>
                            <SeatSelection />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-bookings"
                    element={
                        <ProtectedRoute>
                            <MyBookings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/booking-success"
                    element={
                        <ProtectedRoute>
                            <BookingSuccess />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ticket/:bookingRef"
                    element={
                        <ProtectedRoute>
                            <TicketDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/track/:bookingRef"
                    element={
                        <ProtectedRoute>
                            <LiveTracking />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/track-trip/:scheduleId"
                    element={
                        <ProtectedRoute>
                            <LiveTracking />
                        </ProtectedRoute>
                    }
                />

                {/* Operator Routes */}
                <Route
                    path="/operator/dashboard"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <OperatorDashboard />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/create-bus"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <CreateBus />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/create-route"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <CreateRoute />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/create-schedule"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <CreateSchedule />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/bookings"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <OperatorBookings />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/buses"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <MyBuses />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/routes"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <MyRoutes />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/schedules"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <MySchedules />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/operator/reviews"
                    element={
                        <RoleProtectedRoute allowedRole="operator_admin">
                            <OperatorReviews />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;