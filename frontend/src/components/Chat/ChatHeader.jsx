import React from 'react';
import { useSocket } from '../../context/socketContext.jsx';

const ChatHeader = ({ conversation, currentUser, onBack }) => {
    const { isUserOnline, getTypingUsers } = useSocket();

    const getOtherParticipant = () => {
        return conversation.participants.find(p => p._id !== currentUser._id);
    };

    const otherParticipant = getOtherParticipant();
    const isOnline = otherParticipant && isUserOnline(otherParticipant._id);
    const typingUsers = getTypingUsers(conversation._id);

    const getStatusText = () => {
        if (typingUsers.length > 0) {
            if (typingUsers.length === 1) {
                return `${typingUsers[0].name} is typing...`;
            } else {
                return `${typingUsers.length} people are typing...`;
            }
        }
        
        if (isOnline) {
            return 'Active now';
        }
        
        return 'Offline';
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
                {/* Back Button (Mobile) */}
                <button
                    onClick={onBack}
                    className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Profile Info */}
                <div className="flex items-center">
                    <div className="relative">
                        <img
                            src={otherParticipant?.profilePic || '/default-avatar.png'}
                            alt={otherParticipant?.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {/* Online Status Indicator */}
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>

                    <div className="ml-3">
                        <h3 className="font-medium text-gray-900">
                            {otherParticipant?.name || 'Unknown User'}
                        </h3>
                        <p className={`text-sm ${typingUsers.length > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                            {getStatusText()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
                {/* Voice Call Button */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </button>

                {/* Video Call Button */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>

                {/* Info Button */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;