import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = ({ isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // New state for error handling
  const [error, setError] = useState({
    general: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const nav = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear specific field error when user starts typing
    if (error[name]) {
      setError(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    // Clear previous errors
    setError({
      general: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!isValid) {
      setError(prev => ({
        ...prev,
        ...errors
      }));
    }

    return isValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset general error
    setError(prev => ({ ...prev, general: '' }));

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      nav('/home');
      window.location.reload();
    } catch (error) {
      // Handle specific backend errors
      if (error.response) {
        // Backend returned an error response
        const errorMessage = error.response.data.message || 'Registration failed';
        
        // Check for specific backend error types
        switch (error.response.status) {
          case 400:
            setError(prev => ({ ...prev, general: errorMessage }));
            break;
          case 409:
            // Conflict error (e.g., email already exists)
            setError(prev => ({ ...prev, email: 'Email is already registered' }));
            break;
          case 422:
            // Validation error from backend
            if (error.response.data.errors) {
              const backendErrors = error.response.data.errors;
              setError(prev => ({
                ...prev,
                name: backendErrors.name || '',
                email: backendErrors.email || '',
                password: backendErrors.password || ''
              }));
            }
            break;
          default:
            setError(prev => ({ ...prev, general: 'An unexpected error occurred' }));
        }
      } else if (error.request) {
        // Network error or no response received
        setError(prev => ({ ...prev, general: 'No response from server. Please check your internet connection.' }));
      } else {
        // Other errors
        setError(prev => ({ ...prev, general: 'An unexpected error occurred' }));
      }
      
      console.error('Signup error:', error);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Display general error message */}
      {error.general && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900 bg-opacity-50 text-red-200' : 'bg-red-50 text-red-800'}`}>
          <p>{error.general}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Full Name
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-user ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            } ${error.name ? 'border-red-500' : ''}`}
            placeholder="John Doe"
          />
        </div>
        {error.name && <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error.name}</p>}
      </div>

      {/* Similar modifications for email, password, and confirm password inputs */}
      <div>
        <label htmlFor="signup-email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Email address
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-envelope ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            } ${error.email ? 'border-red-500' : ''}`}
            placeholder="example@email.com"
          />
        </div>
        {error.email && <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error.email}</p>}
      </div>

      <div>
        <label htmlFor="signup-password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-lock ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            } ${error.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
          />
        </div>
        {error.password && <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Confirm Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-check-circle ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            onChange={handleChange}
            value={formData.confirmPassword}
            required
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            } ${error.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
          />
        </div>
        {error.confirmPassword && <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error.confirmPassword}</p>}
      </div>

      {/* Rest of the component remains the same */}
      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
        />
        <label htmlFor="terms" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          I agree to the <a href="#" className={`font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Terms</a> and <a href="#" className={`font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Privacy Policy</a>
        </label>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <i className="fas fa-user-plus text-indigo-500 group-hover:text-indigo-400"></i>
          </span>
          Create Account
        </button>
      </div>

      {/* Social Signup section remains the same */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div>
            <button
              className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="fab fa-google"></i>
            </button>
          </div>

          <div>
            <button
              className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="fab fa-facebook-f"></i>
            </button>
          </div>

          <div>
            <button
              className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="fab fa-github"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Signup;