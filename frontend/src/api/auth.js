import { createAxiosInstance } from "./axiosHelper";

const axios = createAxiosInstance();

export const authAPI = {
    login: async (regd_no, password) => {
        try {
            const response = await axios.post('/auth/login', { regd_no, password });
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },
    register: async (name, email, password) => {
        try {
            const response = await axios.post('/auth/register', { name, email, password });
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },
    verifyOTP: async (email, otp) => {
        try {
            const response = await axios.post('/auth/verify-otp', { email, otp });
            return response.data;
        } catch (error) {
            console.error('OTP Verification error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'OTP verification failed');
        }
    },
    regenerateOTP: async (email) => {
        try {
            const response = await axios.post('/auth/regenerate-otp', { email });
            return response.data;
        } catch (error) {
            console.error('Regenerate OTP error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to regenerate OTP');
        }
    },
    logout: async () => {
        try {
            await axios.get('/auth/logout')
        } catch (error) {
            console.error('logout error', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to logout');
        }
    },
    verifyToken: async (token) => {
    try {
      const response = await axios.get('/auth/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};