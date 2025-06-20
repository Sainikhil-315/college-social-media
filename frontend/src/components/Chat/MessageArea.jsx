import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const MessageArea = ({ messages, currentUser, conversation }) => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    console.log("messages", messages);
    console.log("Current user", currentUser);
    console.log("conversation in message area", conversation);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        const groups = {};
        
        messages.forEach(message => {
            const date = new Date(message.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        
        return groups;
    };

    const formatDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    };

    // Check if messages should be grouped together (same sender, within 5 minutes)
    const shouldGroupMessages = (currentMessage, previousMessage) => {
        if (!currentMessage || !previousMessage) return false;
        
        const isSameSender = currentMessage.sender._id === previousMessage.sender._id;
        const timeDiff = new Date(currentMessage.createdAt) - new Date(previousMessage.createdAt);
        const isWithinTimeLimit = timeDiff < 5 * 60 * 1000; // 5 minutes
        
        return isSameSender && isWithinTimeLimit;
    };

    const groupedMessages = groupMessagesByDate(messages);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500">Send a message to start the conversation</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50"
        >
            <div className="max-w-4xl mx-auto">
                {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date} className="mb-6">
                        {/* Date Separator */}
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white px-3 py-1 rounded-full shadow-sm border">
                                <span className="text-xs font-medium text-gray-600">
                                    {formatDateLabel(date)}
                                </span>
                            </div>
                        </div>

                        {/* Messages for this date */}
                        {dayMessages.map((message, index) => {
                            const previousMessage = index > 0 ? dayMessages[index - 1] : null;
                            const nextMessage = index < dayMessages.length - 1 ? dayMessages[index + 1] : null;
                            
                            const isGroupedWithPrevious = shouldGroupMessages(message, previousMessage);
                            const isGroupedWithNext = shouldGroupMessages(nextMessage, message);
                            
                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isOwn={message.sender._id === currentUser._id}
                                    showAvatar={!isGroupedWithNext}
                                    showTimestamp={!isGroupedWithNext}
                                    isLastInGroup={!isGroupedWithNext}
                                    isGrouped={isGroupedWithPrevious}
                                    conversation={conversation}
                                />
                            );
                        })}
                    </div>
                ))}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default MessageArea;