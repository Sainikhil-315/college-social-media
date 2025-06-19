const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Store online users
const onlineUsers = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace('Bearer ', '');
        
        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Get user details
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Invalid authentication token'));
    }
};

const handleSocketConnection = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);

    io.on('connection', async (socket) => {
        console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);
        
        // Store user as online
        onlineUsers.set(socket.userId, {
            socketId: socket.id,
            user: socket.user,
            lastSeen: new Date()
        });

        // Join user to their personal room (for notifications)
        socket.join(socket.userId);

        // Join user to all their conversation rooms
        try {
            const userConversations = await Conversation.find({ 
                participants: socket.userId 
            }).select('_id');

            userConversations.forEach(conversation => {
                socket.join(conversation._id.toString());
                console.log(`User ${socket.user.name} joined conversation room: ${conversation._id}`);
            });

            // Emit user online status to all conversation participants
            userConversations.forEach(async (conversation) => {
                const fullConversation = await Conversation.findById(conversation._id)
                    .populate('participants', '_id');
                
                // Notify other participants that user is online
                fullConversation.participants.forEach(participant => {
                    if (participant._id.toString() !== socket.userId) {
                        socket.to(participant._id.toString()).emit('userOnline', {
                            userId: socket.userId,
                            user: {
                                _id: socket.user._id,
                                name: socket.user.name,
                                profilePic: socket.user.profilePic
                            },
                            timestamp: new Date()
                        });
                    }
                });
            });

        } catch (error) {
            console.error('Error joining conversation rooms:', error);
        }

        // Handle joining specific conversation room
        socket.on('joinRoom', async (data) => {
            try {
                const { conversationId } = data;
                
                if (!conversationId) {
                    socket.emit('error', { message: 'Conversation ID is required' });
                    return;
                }

                // Verify user is a participant in this conversation
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(socket.userId)) {
                    socket.emit('error', { message: 'Not authorized to join this conversation' });
                    return;
                }

                socket.join(conversationId);
                socket.emit('joinedRoom', { conversationId });
                
                // Notify other participants that user joined
                socket.to(conversationId).emit('userJoinedRoom', {
                    userId: socket.userId,
                    user: socket.user,
                    conversationId,
                    timestamp: new Date()
                });

                console.log(`User ${socket.user.name} manually joined room: ${conversationId}`);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join conversation room' });
            }
        });

        // Handle leaving specific conversation room
        socket.on('leaveRoom', (data) => {
            try {
                const { conversationId } = data;
                
                if (!conversationId) {
                    socket.emit('error', { message: 'Conversation ID is required' });
                    return;
                }

                socket.leave(conversationId);
                socket.emit('leftRoom', { conversationId });
                
                // Notify other participants that user left
                socket.to(conversationId).emit('userLeftRoom', {
                    userId: socket.userId,
                    user: socket.user,
                    conversationId,
                    timestamp: new Date()
                });

                console.log(`User ${socket.user.name} left room: ${conversationId}`);
            } catch (error) {
                console.error('Error leaving room:', error);
                socket.emit('error', { message: 'Failed to leave conversation room' });
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            const { conversationId, isTyping } = data;
            
            if (!conversationId) {
                socket.emit('error', { message: 'Conversation ID is required' });
                return;
            }

            // Broadcast typing status to other participants in the conversation
            socket.to(conversationId).emit('userTyping', {
                userId: socket.userId,
                user: {
                    _id: socket.user._id,
                    name: socket.user.name,
                    profilePic: socket.user.profilePic
                },
                conversationId,
                isTyping,
                timestamp: new Date()
            });
        });

        // Handle real-time message sending (alternative to HTTP endpoint)
        socket.on('sendMessage', async (data) => {
            try {
                const { conversationId, content, messageType = 'text' } = data;

                // Validate input
                if (!content || content.trim().length === 0) {
                    socket.emit('error', { message: 'Message content cannot be empty' });
                    return;
                }

                if (!conversationId) {
                    socket.emit('error', { message: 'Conversation ID is required' });
                    return;
                }

                // Check if conversation exists and user is a participant
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }

                if (!conversation.participants.includes(socket.userId)) {
                    socket.emit('error', { message: 'Not authorized to send messages to this conversation' });
                    return;
                }

                // Create new message
                const newMessage = new Message({
                    conversationId,
                    sender: socket.userId,
                    content: content.trim(),
                    messageType,
                    status: 'unread'
                });

                await newMessage.save();

                // Update conversation's last message
                conversation.lastMessage = newMessage._id;
                conversation.updatedAt = new Date();
                await conversation.save();

                // Populate sender details
                const populatedMessage = await Message.findById(newMessage._id)
                    .populate('sender', 'name email profilePic');

                // Emit message to all participants
                io.to(conversationId).emit('receiveMessage', {
                    ...populatedMessage.toObject(),
                    conversationId: conversationId
                });

                // Send delivery confirmation to sender
                socket.emit('messageDelivered', {
                    messageId: newMessage._id,
                    conversationId: conversationId,
                    timestamp: newMessage.createdAt
                });

                // Send notifications to offline participants
                const offlineParticipants = conversation.participants.filter(
                    participantId => participantId.toString() !== socket.userId && 
                    !onlineUsers.has(participantId.toString())
                );

                offlineParticipants.forEach(participantId => {
                    // You can implement push notifications here
                    console.log(`Send push notification to offline user: ${participantId}`);
                });

            } catch (error) {
                console.error('Error sending message via socket:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle message read receipts
        socket.on('markMessageAsRead', async (data) => {
            try {
                const { messageId } = data;

                if (!messageId) {
                    socket.emit('error', { message: 'Message ID is required' });
                    return;
                }

                const message = await Message.findById(messageId);
                if (!message) {
                    socket.emit('error', { message: 'Message not found' });
                    return;
                }

                // Check authorization
                const conversation = await Conversation.findById(message.conversationId);
                if (!conversation.participants.includes(socket.userId)) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                // Don't allow sender to mark their own message as read
                if (message.sender.toString() === socket.userId) {
                    socket.emit('error', { message: 'Cannot mark your own message as read' });
                    return;
                }

                // Update message status
                if (message.status !== 'read') {
                    message.status = 'read';
                    message.readAt = new Date();
                    await message.save();

                    // Notify conversation participants
                    io.to(message.conversationId.toString()).emit('messageRead', {
                        messageId: message._id,
                        readBy: socket.userId,
                        readAt: message.readAt
                    });
                }

            } catch (error) {
                console.error('Error marking message as read:', error);
                socket.emit('error', { message: 'Failed to mark message as read' });
            }
        });

        // Handle getting online users for a conversation
        socket.on('getOnlineUsers', async (data) => {
            try {
                const { conversationId } = data;

                if (!conversationId) {
                    socket.emit('error', { message: 'Conversation ID is required' });
                    return;
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(socket.userId)) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                // Get online participants
                const onlineParticipants = conversation.participants
                    .filter(participantId => onlineUsers.has(participantId.toString()))
                    .map(participantId => {
                        const onlineUser = onlineUsers.get(participantId.toString());
                        return {
                            userId: participantId,
                            user: onlineUser.user,
                            lastSeen: onlineUser.lastSeen
                        };
                    });

                socket.emit('onlineUsers', {
                    conversationId,
                    onlineUsers: onlineParticipants
                });

            } catch (error) {
                console.error('Error getting online users:', error);
                socket.emit('error', { message: 'Failed to get online users' });
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User ${socket.user.name} disconnected`);
            
            // Remove user from online users
            onlineUsers.delete(socket.userId);

            try {
                // Get user's conversations to notify other participants
                const userConversations = await Conversation.find({ 
                    participants: socket.userId 
                }).populate('participants', '_id');

                // Notify other participants that user went offline
                userConversations.forEach(conversation => {
                    conversation.participants.forEach(participant => {
                        if (participant._id.toString() !== socket.userId) {
                            socket.to(participant._id.toString()).emit('userOffline', {
                                userId: socket.userId,
                                user: {
                                    _id: socket.user._id,
                                    name: socket.user.name,
                                    profilePic: socket.user.profilePic
                                },
                                lastSeen: new Date()
                            });
                        }
                    });
                });

            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });

        // Handle connection errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
            socket.emit('error', { message: 'Connection error occurred' });
        });

        // Send initial connection confirmation
        socket.emit('connected', {
            message: 'Successfully connected to chat server',
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date()
        });
    });

    // Handle connection errors
    io.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });
};

// Helper function to get online users (can be used by other parts of the app)
const getOnlineUsers = () => {
    return Array.from(onlineUsers.entries()).map(([userId, userData]) => ({
        userId,
        ...userData
    }));
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};

// Helper function to get online users count
const getOnlineUsersCount = () => {
    return onlineUsers.size;
};

module.exports = {
    handleSocketConnection,
    getOnlineUsers,
    isUserOnline,
    getOnlineUsersCount
};