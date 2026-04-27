import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Page Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import RestaurantGrid from './components/RestaurantGrid';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Dashboard Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RestaurantPage from './pages/customer/RestaurantPage';
import OrderTracking from './pages/customer/OrderTracking';
import OwnerDashboard from './pages/restaurant/OwnerDashboard';
import DriverDashboard from './pages/delivery/DriverDashboard';

// Landing Page
const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <Categories />
    <RestaurantGrid />
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Customer Routes */}
            <Route path="/customer" element={
              <ProtectedRoute roles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/restaurant/:id" element={
              <ProtectedRoute roles={['customer']}>
                <RestaurantPage />
              </ProtectedRoute>
            } />
            <Route path="/customer/track/:orderId" element={
              <ProtectedRoute roles={['customer']}>
                <OrderTracking />
              </ProtectedRoute>
            } />

            {/* Restaurant Owner Routes */}
            <Route path="/restaurant" element={
              <ProtectedRoute roles={['restaurant']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } />

            {/* Delivery Driver Routes */}
            <Route path="/delivery" element={
              <ProtectedRoute roles={['delivery']}>
                <DriverDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
