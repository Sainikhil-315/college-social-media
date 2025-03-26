import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {useNavigate} from 'react-router-dom';

const Login = ({ isDarkMode }) => {

    const [formData, setFormData ] = useState({
      regd_no: '',
      password: '',
    });

    const { login } = useAuth();
    const nav = useNavigate();

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState, [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await login(formData.regd_no.toUpperCase(), formData.password);
        nav('/home');
      } catch (error) {
        console.error('Login error:', error);
      }
    }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Registration Number
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-envelope ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="regd_no"
            name="regd_no"
            value={formData.regd_no}
            onChange={handleChange}
            type="text"
            required
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            }`}
            placeholder="regd_no"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-lock ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            autoComplete="current-password"
            required
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            }`}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
          />
          <label htmlFor="remember-me" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            Remember me
          </label>
        </div>

        <button type="button" className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
          Forgot password?
        </button>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <i className="fas fa-sign-in-alt text-indigo-500 group-hover:text-indigo-400"></i>
          </span>
          Sign in
        </button>
      </div>

      {/* Social Login */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>Or continue with</span>
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

export default Login;