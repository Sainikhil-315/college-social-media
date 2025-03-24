import { createAxiosInstance } from "./axiosHelper";

const axios = createAxiosInstance();

export const authAPI = {
    login: async (regd_no, password) => {
        try {
            const response = await axios.post('/auth/login', { regd_no, password })
            localStorage.setItem('token', response.token);
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },
    register: async (name, email, password) => {
        try {
            const response = await axios.post('/auth/register', {name, email, password});
            localStorage.setItem('token', response.token);
            return response.data
        } catch (error) {
            console.error('Registration error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },
}