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
import Notifications from './pages/Notifications.jsx';
import Search from './pages/Search.jsx';
import Create from './pages/Create.jsx';
import Followers from "./components/followers.jsx";
import PostDetail from "./components/PostDetail.jsx";

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

// Layout component to wrap Sidebar with protected content
const SidebarLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        
        {/* Protected Routes with Sidebar */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Home />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Search />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Messages />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Notifications />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Create />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId?"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Profile />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId?/followers"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <Followers />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <PostDetail />
              </SidebarLayout>
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