import React, { useState, useContext, useEffect, createContext } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (regd_no, password) => {
    try {
      const response = await authAPI.login(regd_no, password);
      console.log("Response: ", response);
      if (response?.token) {
        localStorage.setItem("token", response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
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
      if (response?.token) {
        localStorage.setItem("token", response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      throw new Error("Error occured");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
