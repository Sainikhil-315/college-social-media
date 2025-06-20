import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/RegisterPage.jsx";
import Home from "./pages/Home.jsx";
import OTPVerification from "./components/OTPVerification.jsx";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LoadingSpinner from "./utils/LoadingSpinner";
import NotFound from "./utils/NotFound";
import Messages from "./pages/Messages.jsx";
import Notifications from './pages/Notifications.jsx';
import Search from './pages/Search.jsx';
import Create from './pages/Create.jsx';
import Followers from "./components/followers.jsx";
import PostDetail from "./components/PostDetail.jsx";
import Following from "./components/Following.jsx";
import { SocketProvider } from "./context/socketContext.jsx";
import ConversationList from "./components/Chat/ConversationList.jsx";

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

// Wrapper component for socket context (only for authenticated users)
const SocketContextWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }
  
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
};

function App() {
  return (
    <Router>
      <SocketContextWrapper>
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
            path="/explore"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Explore</h1>
                    <p className="text-gray-600">Discover new content</p>
                  </div>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reels"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Reels</h1>
                    <p className="text-gray-600">Watch short videos</p>
                  </div>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Messages Routes */}
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
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Messages />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/messages/new/:userId"
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
          
          {/* Profile Routes */}
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
            path="/profile/:userId?/following"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Following />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Post Detail Route */}
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
          
          {/* Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-gray-600">Manage your account settings</p>
                  </div>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Activity Route */}
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Your Activity</h1>
                    <p className="text-gray-600">See your recent activity</p>
                  </div>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Saved Route */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Saved</h1>
                    <p className="text-gray-600">Your saved posts</p>
                  </div>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/home" />} />  
         
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketContextWrapper>
    </Router>
  );
}

export default App;