import React from 'react';
import { useSocket } from '../../context/socketContext.jsx';
import { Link } from 'react-router-dom';

const ConversationList = ({ 
    conversations, 
    selectedConversation, 
    onSelectConversation, 
    currentUser, 
    searchQuery,
    unreadCounts 
}) => {
    const { isUserOnline } = useSocket();

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conversation => {
        const otherParticipant = conversation.participants.find(p => p._id !== currentUser._id);
        const participantName = otherParticipant?.name?.toLowerCase() || '';
        const searchLower = searchQuery.toLowerCase();
        
        return participantName.includes(searchLower) || 
               conversation.lastMessage?.toLowerCase().includes(searchLower);
    });

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== currentUser._id);
    };

    const truncateMessage = (message, maxLength = 40) => {
        if (!message) return 'No messages yet';
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    if (filteredConversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">
                        {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </p>
                    {!searchQuery && (
                        <p className="text-sm text-gray-400 mt-1">Start a new conversation by clicking the + button</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?._id === conversation._id;
                const isOnline = otherParticipant && isUserOnline(otherParticipant._id);
                const unreadCount = unreadCounts[conversation._id] || 0;
                const isUnread = unreadCount > 0;

                return (
                    <Link to={`/messages/${conversation.conversationId}`}
                        key={conversation._id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`
                            flex items-center p-4 cursor-pointer border-b border-gray-100 
                            hover:bg-gray-50 transition-colors duration-200
                            ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                        `}
                    >
                        {/* Profile Picture */}
                        <div className="relative">
                            <img
                                src={otherParticipant?.profilePic || '/default-avatar.png'}
                                alt={otherParticipant?.name || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            {/* Online Status Indicator */}
                            {isOnline && (
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                        </div>

                        {/* Conversation Info */}
                        <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className={`text-sm font-medium truncate ${isUnread ? 'font-semibold' : ''}`}>
                                    {otherParticipant?.name || 'Unknown User'}
                                </h3>
                                <div className="flex items-center ml-2">
                                    {conversation.lastMessageTimestamp && (
                                        <span className="text-xs text-gray-500">
                                            {formatTime(conversation.lastMessageTimestamp)}
                                        </span>
                                    )}
                                    {unreadCount > 0 && (
                                        <div className="ml-2 bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center mt-1">
                                {/* Message Status (if current user sent the last message) */}
                                {conversation.lastMessageSender === currentUser._id && (
                                    <div className="mr-1">
                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                
                                <p className={`text-sm text-gray-600 truncate ${isUnread ? 'font-medium' : ''}`}>
                                    {conversation.lastMessageSender === currentUser._id && 'You: '}
                                    {truncateMessage(conversation.lastMessage)}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default ConversationList;