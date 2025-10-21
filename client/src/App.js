import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// User Pages
import UserLayout from './components/layouts/UserLayout';
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';
import Profile from './pages/user/Profile';
import Plans from './pages/user/Plans';
import CheckSeats from './pages/user/CheckSeats';
import SeatSelection from './pages/user/SeatSelection';
import Checkout from './pages/user/Checkout';
import PaymentSuccess from './pages/user/PaymentSuccess';
import MyBookings from './pages/user/MyBookings';
import Wallet from './pages/user/Wallet';
import Facilities from './pages/user/Facilities';
import Support from './pages/user/Support';
import Offers from './pages/user/Offers';
import AdvanceBooking from './pages/user/AdvanceBooking';
import Notifications from './pages/user/Notifications';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import SeatManagement from './pages/admin/SeatManagement';
import PlanManagement from './pages/admin/PlanManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import FacilityManagement from './pages/admin/FacilityManagement';
import BannerManagement from './pages/admin/BannerManagement';
import NoticeManagement from './pages/admin/NoticeManagement';
import CouponManagement from './pages/admin/CouponManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import Reports from './pages/admin/Reports';
import ExpenseRecords from './pages/admin/ExpenseRecords';
import GatewaySettings from './pages/admin/GatewaySettings';
import OfferManagement from './pages/admin/OfferManagement';
import AdvanceBookingManagement from './pages/admin/AdvanceBookingManagement';
import SupportManagement from './pages/admin/SupportManagement';
import GalleryManagement from './pages/admin/GalleryManagement';
import AdminNotifications from './pages/admin/AdminNotifications';
import RefundManagement from './pages/admin/RefundManagement';
import AuditLogs from './pages/admin/AuditLogs';
import UserRefundRequests from './pages/admin/UserRefundRequests';
import MyRefundRequests from './pages/user/MyRefundRequests';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public User Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected User Routes */}
              <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                <Route index element={<Home />} />
                <Route path="profile" element={<Profile />} />
                <Route path="plans" element={<Plans />} />
                <Route path="check-seats" element={<CheckSeats />} />
                <Route path="seat-selection" element={<SeatSelection />} />
                <Route path="seats/:planId" element={<SeatSelection />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="my-refund-requests" element={<MyRefundRequests />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="facilities" element={<Facilities />} />
                <Route path="support" element={<Support />} />
                <Route path="offers" element={<Offers />} />
                <Route path="advance-booking" element={<AdvanceBooking />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="seats" element={<SeatManagement />} />
                <Route path="plans" element={<PlanManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="facilities" element={<FacilityManagement />} />
                <Route path="banners" element={<BannerManagement />} />
                <Route path="notices" element={<NoticeManagement />} />
                <Route path="coupons" element={<CouponManagement />} />
                <Route path="notifications" element={<NotificationManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="expenses" element={<ExpenseRecords />} />
                <Route path="gateway-settings" element={<GatewaySettings />} />
                <Route path="offers" element={<OfferManagement />} />
                <Route path="advance-bookings" element={<AdvanceBookingManagement />} />
                <Route path="support" element={<SupportManagement />} />
                <Route path="gallery" element={<GalleryManagement />} />
                <Route path="admin-notifications" element={<AdminNotifications />} />
                <Route path="refunds" element={<RefundManagement />} />
                <Route path="user-refund-requests" element={<UserRefundRequests />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

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
              theme="colored"
            />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
