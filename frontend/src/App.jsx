import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/RegisterPage.jsx";
import Home from "./pages/Home.jsx";
import OTPVerification from "./components/OTPVerification.jsx";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LoadingSpinner from "./utils/LoadingSpinner"; // Create this component
import NotFound from "./utils/NotFound";
import Messages from "./pages/Messages.jsx";
import Notifications from './pages/Notifications.jsx'
import Search from './pages/Search.jsx'
import Create from './pages/Create.jsx'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, requiresVerification, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requiresVerification) {
    return <Navigate to="/verify-otp" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route 
          path="/verify-otp" 
          element={<OTPVerification />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Home />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Profile />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Messages />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Notifications />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Search />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Create />
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/home" />} />  
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;