// src/context/AuthContext.js
import React, { useState, useContext, createContext, useEffect } from "react";
import { authAPI } from "../api/auth";

// 1. Create Context outside
const AuthContext = createContext();

// 2. useAuth Hook defined outside and stable
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.verifyToken(token);
          if (response.user) {
            setCurrentUser(response.user);
            setIsAuthenticated(true);
            setRequiresVerification(false);
          } else {
            localStorage.removeItem("token");
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          localStorage.removeItem("token");
          setCurrentUser(null);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = async (regd_no, password) => {
    try {
      const response = await authAPI.login(regd_no, password);

      if (response.requiresVerification) {
        setRequiresVerification(true);
        setRegisteredEmail(response.email);
        throw new Error("Account requires verification");
      }

      if (response.token) {
        localStorage.setItem("token", response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setRequiresVerification(false);
        return response;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      setRegisteredEmail(email);
      setRequiresVerification(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!registeredEmail) {
      throw new Error("No email found for verification");
    }

    try {
      const response = await authAPI.verifyOTP(registeredEmail, otp);
      if (response.token) {
        localStorage.setItem("token", response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setRequiresVerification(false);
        return response;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRegenerateOTP = async () => {
    if (!registeredEmail) {
      throw new Error("No email found for OTP regeneration");
    }

    try {
      const response = await authAPI.regenerateOTP(registeredEmail);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("token");
      setCurrentUser(null);
      setIsAuthenticated(false);
      setRequiresVerification(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = {
    user: currentUser,
    isAuthenticated,
    registeredEmail,
    requiresVerification,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    verifyOTP: handleVerifyOTP,
    regenerateOTP: handleRegenerateOTP,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
