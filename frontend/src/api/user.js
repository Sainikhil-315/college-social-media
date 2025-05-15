import { createAxiosInstance } from "./axiosHelper";

const axios = createAxiosInstance();

export const userAPI = {
    // Get full user profile by ID
    getUserProfile: async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            
            // console.log("API calling getUserProfile with userId:", userId);
            const response = await axios.get(`/user/profile/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Fetch user profile error:', error);
            throw new Error(
                error.response?.data?.message || 
                'Failed to fetch user profile'
            );
        }
    },

    // Update user profile (bio, profilePic, etc.)
    updateUserProfile: async (updatedData) => {
        try {
            const response = await axios.put('/user/profile/update', updatedData);
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to update user profile');
        }
    },

    // Follow a user
    followUser: async (targetUserId) => {
        try {
            const response = await axios.put(`/user/follow/${targetUserId}`);
            return response.data;
        } catch (error) {
            console.error('Follow user error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to follow user');
        }
    },

    // Unfollow a user
    unfollowUser: async (targetUserId) => {
        try {
            const response = await axios.put(`/user/unfollow/${targetUserId}`);
            return response.data;
        } catch (error) {
            console.error('Unfollow user error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to unfollow user');
        }
    },

    // Get followers list
    getFollowers: async (userId) => {
        try {
            const response = await axios.get(`/user/${userId}/followers`);
            return response.data;
        } catch (error) {
            console.error('Get followers error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to get followers');
        }
    },

    // Get following list
    getFollowing: async (userId) => {
        try {
            const response = await axios.get(`/user/${userId}/following`);
            return response.data;
        } catch (error) {
            console.error('Get following error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to get following list');
        }
    },

    // search user
    searchUser: async (q) => {
        try {
            const response = await axios.get(`/user/search?q=${q}`);
            return response.data;
        } catch (error) {
            console.error('Get following error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to get following list');
        }
    }
};