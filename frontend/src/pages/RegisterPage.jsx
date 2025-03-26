import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login';
import Signup from '../components/Signup';

const RegisterPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { requiresVerification } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (requiresVerification) {
      nav('/verify-otp');
    }
  }, [requiresVerification, nav]);
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full space-y-6 p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className={`rounded-full p-2.5 cursor-pointer ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label="Toggle theme"
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            College Social Media
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 w-1/2 text-center font-medium ${
              activeTab === 'login'
                ? isDarkMode
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'border-b-2 border-indigo-600 text-indigo-600'
                : isDarkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-4 py-2 w-1/2 text-center font-medium ${
              activeTab === 'signup'
                ? isDarkMode
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'border-b-2 border-indigo-600 text-indigo-600'
                : isDarkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            <i className="fas fa-user-plus mr-2"></i>
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        <div className="mt-6">
          {activeTab === 'login' ? (
            <Login isDarkMode={isDarkMode} />
          ) : (
            <Signup isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;