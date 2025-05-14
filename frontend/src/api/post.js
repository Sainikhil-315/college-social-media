import { createAxiosInstance } from "./axiosHelper";

const axios = createAxiosInstance();

export const postAPI = {
    // Create a new post
    createPost: async (postData) => {
        try {
            const response = await axios.post('/post/create', postData);
            return response.data;
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error(error.response?.data?.message || 'Failed to create post');
        }
    },

    // Get all posts (Feed)
    getAllPosts: async () => {
        try {
            const response = await axios.get('/post/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all posts:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch posts');
        }
    },

    // Get a single post by ID
    getPostById: async (postId) => {
        try {
            const response = await axios.get(`/post/${postId}`);
            // console.log(response);
            return response.data;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch post');
        }
    },

    // Delete a post by ID
    deletePost: async (postId) => {
        try {
            const response = await axios.delete(`/post/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete post');
        }
    },

    // Like a post
    likePost: async (postId) => {
        try {
            const response = await axios.put(`/post/like/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Error liking post:', error);
            throw new Error(error.response?.data?.message || 'Failed to like post');
        }
    },

    // Unlike a post
    unlikePost: async (postId) => {
        try {
            const response = await axios.put(`/post/unlike/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Error unliking post:', error);
            throw new Error(error.response?.data?.message || 'Failed to unlike post');
        }
    },

    // Comment on a post
    commentOnPost: async (postId, text) => {
        try {
            const response = await axios.post(`/post/comment/${postId}`, { text });
            return response.data;
        } catch (error) {
            console.error('Error commenting on post:', error);
            throw new Error(error.response?.data?.message || 'Failed to comment on post');
        }
    },

    // Delete a comment on a post
    deleteComment: async (postId, commentId) => {
        try {
            const response = await axios.delete(`/post/comment/${postId}/${commentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete comment');
        }
    },

    // Get posts by currently logged-in user
    getMyPosts: async () => {
        try {
            const response = await axios.get('/user/posts');
            return response.data;
        } catch (error) {
            console.error('Error fetching my posts:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch your posts');
        }
    },
};
