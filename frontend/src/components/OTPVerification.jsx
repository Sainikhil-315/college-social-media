import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OTPVerification = ({ isDarkMode }) => {
  const [otp, setOTP] = useState('');
  const [error, setError] = useState(null);
  const { verifyOTP, regenerateOTP, registeredEmail } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await verifyOTP(otp);
      nav('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegenerateOTP = async () => {
    try {
      setError(null);
      await regenerateOTP();
      alert('New OTP has been sent to your email');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='border rounded-xl mt-40 mx-100 shadow-sm hover:shadow-indigo-600'>
      <form className="space-y-6 m-15" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="otp" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Enter OTP
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas fa-key ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </div>
          <input
            id="otp"
            name="otp"
            type="number"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            required
            maxLength="6"
            min={0}
            max={999999}
            className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'
            }`}
            placeholder="Enter 6-digit OTP"
          />
        </div>
      </div>

      {error && (
        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            OTP sent to: {registeredEmail}
          </span>
        </div>
        <button 
          type="button" 
          onClick={handleRegenerateOTP}
          className={`font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
        >
          Resend OTP
        </button>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <i className="fas fa-check text-indigo-500 group-hover:text-indigo-400"></i>
          </span>
          Verify OTP
        </button>
      </div>
    </form>
    </div>
  );
};

export default OTPVerification;