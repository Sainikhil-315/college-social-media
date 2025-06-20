// contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [conversations, setConversations] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    
    const { user, token } = useAuth();
    const socketRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        if (user && token) {
            const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
            
            const newSocket = io(serverUrl, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                forceNew: true
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            // Connection event handlers
            newSocket.on('connect', () => {
                console.log('Connected to server:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('connected', (data) => {
                console.log('Socket authenticated:', data);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from server:', reason);
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                setIsConnected(false);
            });

            // Message event handlers
            newSocket.on('receiveMessage', (messageData) => {
                console.log('New message received:', messageData);
                addMessageToConversation(messageData.conversationId, messageData);
                updateConversationLastMessage(messageData.conversationId, messageData);
                
                // Update unread count if not the sender
                if (messageData.sender._id !== user._id) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [messageData.conversationId]: (prev[messageData.conversationId] || 0) + 1
                    }));
                }
            });

            newSocket.on('messageDelivered', (data) => {
                console.log('Message delivered:', data);
                updateMessageStatus(data.conversationId, data.messageId, 'delivered');
            });

            newSocket.on('messageRead', (data) => {
                console.log('Message read:', data);
                updateMessageStatus(data.conversationId, data.messageId, 'read');
            });

            newSocket.on('allMessagesRead', (data) => {
                console.log('All messages read:', data);
                markAllMessagesAsRead(data.conversationId);
                setUnreadCounts(prev => ({
                    ...prev,
                    [data.conversationId]: 0
                }));
            });

            newSocket.on('messageEdited', (messageData) => {
                console.log('Message edited:', messageData);
                updateMessageInConversation(messageData.conversationId, messageData);
            });

            newSocket.on('messageDeleted', (data) => {
                console.log('Message deleted:', data);
                removeMessageFromConversation(data.conversationId, data.messageId);
            });

            newSocket.on('messageDeletedForEveryone', (data) => {
                console.log('Message deleted for everyone:', data);
                removeMessageFromConversation(data.conversationId, data.messageId);
            });

            // Typing event handlers
            newSocket.on('userTyping', (data) => {
                if (data.userId !== user._id) {
                    setTypingUsers(prev => ({
                        ...prev,
                        [data.conversationId]: {
                            ...prev[data.conversationId],
                            [data.userId]: data.isTyping ? data.user : null
                        }
                    }));

                    // Remove typing indicator after timeout
                    if (!data.isTyping) {
                        setTimeout(() => {
                            setTypingUsers(prev => {
                                const newState = { ...prev };
                                if (newState[data.conversationId]) {
                                    delete newState[data.conversationId][data.userId];
                                    if (Object.keys(newState[data.conversationId]).length === 0) {
                                        delete newState[data.conversationId];
                                    }
                                }
                                return newState;
                            });
                        }, 3000);
                    }
                }
            });

            // Online status handlers
            newSocket.on('userOnline', (data) => {
                console.log('User came online:', data.user.name);
                setOnlineUsers(prev => [
                    ...prev.filter(u => u.userId !== data.userId),
                    { userId: data.userId, user: data.user, timestamp: data.timestamp }
                ]);
            });

            newSocket.on('userOffline', (data) => {
                console.log('User went offline:', data.user.name);
                setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
            });

            newSocket.on('onlineUsers', (data) => {
                setOnlineUsers(data.onlineUsers);
            });

            // Room management handlers
            newSocket.on('joinedRoom', (data) => {
                console.log('Joined room:', data.conversationId);
            });

            newSocket.on('leftRoom', (data) => {
                console.log('Left room:', data.conversationId);
            });

            newSocket.on('userJoinedRoom', (data) => {
                console.log('User joined room:', data.user.name);
            });

            newSocket.on('userLeftRoom', (data) => {
                console.log('User left room:', data.user.name);
            });

            // Error handler
            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            // Notification handlers
            newSocket.on('newMessageNotification', (data) => {
                console.log('New message notification:', data);
                // Handle push notifications here
            });

            // Group management handlers
            newSocket.on('participantAdded', (data) => {
                console.log('Participant added to group:', data);
                // Update conversation participants
            });

            newSocket.on('participantRemoved', (data) => {
                console.log('Participant removed from group:', data);
                // Update conversation participants
            });

            return () => {
                console.log('Cleaning up socket connection...');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
                socketRef.current = null;
            };
        }
    }, [user, token]);

    // Helper functions
    const addMessageToConversation = (conversationId, message) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: [
                ...(prev[conversationId] || []),
                message
            ]
        }));
    };

    const updateMessageInConversation = (conversationId, updatedMessage) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            )
        }));
    };

    const removeMessageFromConversation = (conversationId, messageId) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter(msg => msg._id !== messageId)
        }));
    };

    const updateMessageStatus = (conversationId, messageId, status) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map(msg =>
                msg._id === messageId ? { ...msg, status } : msg
            )
        }));
    };

    const markAllMessagesAsRead = (conversationId) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map(msg =>
                msg.sender._id !== user._id ? { ...msg, status: 'read' } : msg
            )
        }));
    };

    const updateConversationLastMessage = (conversationId, message) => {
        setConversations(prev => prev.map(conv =>
            conv.conversationId === conversationId
                ? {
                    ...conv,
                    lastMessage: message.content,
                    lastMessageTimestamp: message.createdAt,
                    lastMessageSender: message.sender._id,
                    updatedAt: message.createdAt
                }
                : conv
        ));
    };

    // Socket methods
    const joinRoom = (conversationId) => {
        if (socket && conversationId) {
            socket.emit('joinRoom', { conversationId });
        }
    };

    const leaveRoom = (conversationId) => {
        if (socket && conversationId) {
            socket.emit('leaveRoom', { conversationId });
        }
    };

    const sendMessage = (conversationId, content, messageType = 'text') => {
        if (socket && conversationId && content.trim()) {
            socket.emit('sendMessage', {
                conversationId,
                content: content.trim(),
                messageType
            });
        }
    };

    const markMessageAsRead = (messageId) => {
        if (socket && messageId) {
            socket.emit('markMessageAsRead', { messageId });
        }
    };

    const emitTyping = (conversationId, isTyping) => {
        if (socket && conversationId) {
            socket.emit('typing', { conversationId, isTyping });
        }
    };

    const getOnlineUsers = (conversationId) => {
        if (socket && conversationId) {
            socket.emit('getOnlineUsers', { conversationId });
        }
    };

    const isUserOnline = (userId) => {
        return onlineUsers.some(user => user.userId === userId);
    };

    const getTypingUsers = (conversationId) => {
        return Object.values(typingUsers[conversationId] || {}).filter(Boolean);
    };

    const setMessagesForConversation = (conversationId, messagesArray) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: messagesArray
        }));
    };

    const getMessagesForConversation = (conversationId) => {
        return messages[conversationId] || [];
    };

    const value = {
        socket,
        isConnected,
        onlineUsers,
        messages,
        conversations,
        typingUsers,
        unreadCounts,
        
        // Methods
        joinRoom,
        leaveRoom,
        sendMessage,
        markMessageAsRead,
        emitTyping,
        getOnlineUsers,
        isUserOnline,
        getTypingUsers,
        setMessagesForConversation,
        getMessagesForConversation,
        setConversations,
        setUnreadCounts
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};