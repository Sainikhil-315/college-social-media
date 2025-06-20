import { createAxiosInstance } from "./axiosHelper";

const axios = createAxiosInstance();

export const conversationAPI = {
    // Create a new conversation
    createConversation: async (conversationData) => {
        try {
            const response = await axios.post('/conversations/create', conversationData);
            console.log("Creating conversation...");
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw new Error(error.response?.data?.message || 'Failed to create conversation');
        }
    },

    // Get all conversations for current user
    getUserConversations: async (page = 1, limit = 20) => {
        try {
            const response = await axios.get(`/conversations/user/conversations?page=${page}&limit=${limit}`);
            console.log("Fetching user conversations...");
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
        }
    },

    // Get conversation details
    getConversationDetails: async (conversationId) => {
        try {
            const response = await axios.get(`/conversations/${conversationId}`);
            console.log("Fetching conversation details...");
            return response.data;
        } catch (error) {
            console.error('Error fetching conversation details:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch conversation details');
        }
    },

    // Get conversation between two users
    getConversationBetweenUsers: async (userId, otherUserId) => {
        try {
            const response = await axios.get(`/conversations/${userId}/${otherUserId}`);
            console.log("Fetching conversation between users...");
            return response.data;
        } catch (error) {
            console.error('Error fetching conversation between users:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch conversation');
        }
    },

    // Add participant to group conversation
    addParticipantToGroup: async (conversationId, participantId) => {
        try {
            const response = await axios.post(`/conversations/${conversationId}/participants/add`, {
                participantId
            });
            console.log("Adding participant to group...");
            return response.data;
        } catch (error) {
            console.error('Error adding participant:', error);
            throw new Error(error.response?.data?.message || 'Failed to add participant');
        }
    },

    // Remove participant from group conversation
    removeParticipantFromGroup: async (conversationId, participantId) => {
        try {
            const response = await axios.post(`/conversations/${conversationId}/participants/remove`, {
                participantId
            });
            console.log("Removing participant from group...");
            return response.data;
        } catch (error) {
            console.error('Error removing participant:', error);
            throw new Error(error.response?.data?.message || 'Failed to remove participant');
        }
    }
};

export const messageAPI = {
    // Send a new message
    sendMessage: async (messageData) => {
        try {
            const response = await axios.post('/messages/send', messageData);
            console.log("Sending message...");
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error(error.response?.data?.message || 'Failed to send message');
        }
    },

    // Get messages for a conversation
    getConversationMessages: async (conversationId, page = 1, limit = 50) => {
        try {
            const response = await axios.get(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);
            console.log("Fetching conversation messages...");
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch messages');
        }
    },

    // Mark a message as read
    markAsRead: async (messageId) => {
        try {
            const response = await axios.put(`/messages/markAsRead/${messageId}`);
            console.log("Marking message as read...");
            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw new Error(error.response?.data?.message || 'Failed to mark message as read');
        }
    },

    // Mark all messages in conversation as read
    markAllAsRead: async (conversationId) => {
        try {
            const response = await axios.put(`/messages/markAllAsRead/${conversationId}`);
            console.log("Marking all messages as read...");
            return response.data;
        } catch (error) {
            console.error('Error marking all messages as read:', error);
            throw new Error(error.response?.data?.message || 'Failed to mark all messages as read');
        }
    },

    // Edit a message
    editMessage: async (messageId, content) => {
        try {
            const response = await axios.put(`/messages/editMessage/${messageId}`, { content });
            console.log("Editing message...");
            return response.data;
        } catch (error) {
            console.error('Error editing message:', error);
            throw new Error(error.response?.data?.message || 'Failed to edit message');
        }
    },

    // Delete a message
    deleteMessage: async (messageId, deleteForEveryone = false) => {
        try {
            const response = await axios.delete(`/messages/delete/${messageId}`, {
                data: { deleteForEveryone }
            });
            console.log("Deleting message...");
            return response.data;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete message');
        }
    },

    // Get unread messages count
    getUnreadMessagesCount: async (conversationId = null) => {
        try {
            const url = conversationId 
                ? `/messages/unreadMessageCount/${conversationId}`
                : '/messages/unreadMessageCount';
            const response = await axios.get(url);
            console.log("Fetching unread messages count...");
            return response.data;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
        }
    }
};

// File upload API for media messages
export const fileAPI = {
    // Upload file to Cloudinary
    uploadFile: async (file, type = 'image') => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', `social_media_app/chat/${type}s`);

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${type}/upload`;
            
            const response = await axios.post(cloudinaryUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("File uploaded to Cloudinary...");
            return {
                url: response.data.secure_url,
                publicId: response.data.public_id,
                originalName: file.name,
                size: file.size,
                type: file.type
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }
    },

    // Upload multiple files
    uploadMultipleFiles: async (files, type = 'image') => {
        try {
            const uploadPromises = Array.from(files).map(file => 
                fileAPI.uploadFile(file, type)
            );
            
            const results = await Promise.all(uploadPromises);
            console.log("Multiple files uploaded...");
            return results;
        } catch (error) {
            console.error('Error uploading multiple files:', error);
            throw new Error('Failed to upload files');
        }
    }
};

// Health check API
export const healthAPI = {
    checkServerHealth: async () => {
        try {
            const response = await axios.get('/health');
            return response.data;
        } catch (error) {
            console.error('Server health check failed:', error);
            throw new Error('Server is not responding');
        }
    }
};

// Export all APIs
export const chatAPI = {
    conversation: conversationAPI,
    message: messageAPI,
    file: fileAPI,
    health: healthAPI
};

export default chatAPI;