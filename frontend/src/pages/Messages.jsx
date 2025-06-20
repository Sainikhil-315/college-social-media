// import React, { useState, useEffect, useRef } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faSearch,
//   faPaperPlane,
//   faEllipsisV,
//   faImage,
//   faFile,
//   faSmile,
//   faArrowLeft,
//   faCheck,
//   faCheckDouble,
//   faEdit,
//   faTrash,
//   faUserPlus,
//   faPhone,
//   faVideo
// } from '@fortawesome/free-solid-svg-icons';
// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/socketContext';
// import { chatAPI } from '../api/chatAPI';
// import { userAPI } from "../api/user";

// const Messages = () => {
//   const { user } = useAuth();
//   const {
//     isConnected,
//     joinRoom,
//     leaveRoom,
//     sendMessage: socketSendMessage,
//     emitTyping,
//     isUserOnline,
//     getTypingUsers,
//     getMessagesForConversation,
//     setMessagesForConversation,
//     conversations,
//     setConversations,
//     unreadCounts
//   } = useSocket();

//   // State management
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [messageInput, setMessageInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [showConversationInfo, setShowConversationInfo] = useState(false);
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   // Refs
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   // Load conversations on mount
//   useEffect(() => {
//     loadConversations();
    
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Auto scroll to bottom when new messages arrive
//   useEffect(() => {
//     scrollToBottom();
//   }, [selectedConversation, getMessagesForConversation(selectedConversation?.conversationId)]);

//   // Load conversations
//   const loadConversations = async () => {
//     try {
//       const response = await chatAPI.conversation.getUserConversations();
//       setConversations(response.conversations || []);
//     } catch (error) {
//       console.error('Error loading conversations:', error);
//     }
//   };

//   // Search users
//   const handleSearch = async (query) => {
//     setSearchQuery(query);
//     if (query.trim()) {
//       setIsSearching(true);
//       try {
//         const response = await userAPI.searchUsers(query);
//         setSearchResults(response.users || []);
//       } catch (error) {
//         console.error('Error searching users:', error);
//         setSearchResults([]);
//       } finally {
//         setIsSearching(false);
//       }
//     } else {
//       setSearchResults([]);
//     }
//   };

//   // Start new conversation
//   const startConversation = async (selectedUser) => {
//     try {
//       // Check if conversation already exists
//       const existingConversation = conversations.find(conv =>
//         conv.participants.some(p => p._id === selectedUser._id) && conv.participants.length === 2
//       );

//       if (existingConversation) {
//         setSelectedConversation(existingConversation);
//         joinRoom(existingConversation.conversationId);
//       } else {
//         // Create new conversation
//         const conversationData = {
//           participants: [selectedUser._id],
//           conversationType: 'private'
//         };
        
//         const response = await chatAPI.conversation.createConversation(conversationData);
//         const newConversation = response.conversation;
        
//         setConversations(prev => [newConversation, ...prev]);
//         setSelectedConversation(newConversation);
//         joinRoom(newConversation.conversationId);
//       }
      
//       setSearchQuery('');
//       setSearchResults([]);
//     } catch (error) {
//       console.error('Error starting conversation:', error);
//     }
//   };

//   // Select conversation
//   const selectConversation = async (conversation) => {
//     if (selectedConversation?.conversationId) {
//       leaveRoom(selectedConversation.conversationId);
//     }

//     setSelectedConversation(conversation);
//     joinRoom(conversation.conversationId);

//     // Load messages
//     try {
//       const response = await chatAPI.message.getConversationMessages(conversation.conversationId);
//       setMessagesForConversation(conversation.conversationId, response.messages || []);
      
//       // Mark all messages as read
//       await chatAPI.message.markAllAsRead(conversation.conversationId);
//     } catch (error) {
//       console.error('Error loading messages:', error);
//     }
//   };

//   // Send message
//   const handleSendMessage = async () => {
//     if (!messageInput.trim() && selectedFiles.length === 0) return;
//     if (!selectedConversation) return;

//     let messageContent = messageInput.trim();
//     let messageType = 'text';
//     let attachments = [];

//     // Handle file uploads
//     if (selectedFiles.length > 0) {
//       setIsUploading(true);
//       try {
//         const uploadResults = await chatAPI.file.uploadMultipleFiles(selectedFiles);
//         attachments = uploadResults;
//         messageType = selectedFiles[0].type.startsWith('image/') ? 'image' : 'file';
        
//         if (!messageContent && attachments.length > 0) {
//           messageContent = `Sent ${attachments.length} file(s)`;
//         }
//       } catch (error) {
//         console.error('Error uploading files:', error);
//         setIsUploading(false);
//         return;
//       }
//       setIsUploading(false);
//     }

//     // Send via socket
//     if (editingMessage) {
//       // Edit message
//       try {
//         await chatAPI.message.editMessage(editingMessage._id, messageContent);
//         setEditingMessage(null);
//       } catch (error) {
//         console.error('Error editing message:', error);
//       }
//     } else {
//       // Send new message
//       try {
//         const messageData = {
//           conversationId: selectedConversation.conversationId,
//           content: messageContent,
//           messageType,
//           attachments
//         };
        
//         await chatAPI.message.sendMessage(messageData);
//       } catch (error) {
//         console.error('Error sending message:', error);
//       }
//     }

//     // Reset input
//     setMessageInput('');
//     setSelectedFiles([]);
//     setEditingMessage(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // Handle typing
//   const handleTyping = (value) => {
//     setMessageInput(value);
    
//     if (!isTyping && value.trim()) {
//       setIsTyping(true);
//       emitTyping(selectedConversation?.conversationId, true);
//     }

//     // Clear previous timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Set new timeout
//     typingTimeoutRef.current = setTimeout(() => {
//       setIsTyping(false);
//       emitTyping(selectedConversation?.conversationId, false);
//     }, 1000);
//   };

//   // Handle file selection
//   const handleFileSelect = (event) => {
//     const files = Array.from(event.target.files);
//     setSelectedFiles(files);
//   };

//   // Delete message
//   const handleDeleteMessage = async (messageId, deleteForEveryone = false) => {
//     try {
//       await chatAPI.message.deleteMessage(messageId, deleteForEveryone);
//     } catch (error) {
//       console.error('Error deleting message:', error);
//     }
//   };

//   // Scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // Get conversation display name
//   const getConversationDisplayName = (conversation) => {
//     if (conversation.conversationType === 'group') {
//       return conversation.groupName || 'Group Chat';
//     }
    
//     const otherParticipant = conversation.participants.find(p => p._id !== user._id);
//     return otherParticipant ? otherParticipant.name : 'Unknown User';
//   };

//   // Get conversation display picture
//   const getConversationDisplayPicture = (conversation) => {
//     if (conversation.conversationType === 'group') {
//       return conversation.groupPicture || '/default-group.png';
//     }
    
//     const otherParticipant = conversation.participants.find(p => p._id !== user._id);
//     return otherParticipant ? otherParticipant.profilePic : '/default-avatar.png';
//   };

//   // Format time
//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diff = now - date;
    
//     if (diff < 60000) return 'now';
//     if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
//     if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
//     if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    
//     return date.toLocaleDateString();
//   };

//   // Message status icon
//   const getMessageStatusIcon = (message) => {
//     if (message.sender._id !== user._id) return null;
    
//     switch (message.status) {
//       case 'sent':
//         return <FontAwesomeIcon icon={faCheck} className="text-gray-400 text-xs" />;
//       case 'delivered':
//         return <FontAwesomeIcon icon={faCheckDouble} className="text-gray-400 text-xs" />;
//       case 'read':
//         return <FontAwesomeIcon icon={faCheckDouble} className="text-blue-500 text-xs" />;
//       default:
//         return null;
//     }
//   };

//   if (!isConnected) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Connecting to chat...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-white">
//       {/* Conversations List */}
//       <div className={`${isMobile && selectedConversation ? 'hidden' : 'flex'} flex-col w-full md:w-1/3 border-r border-gray-300`}>
//         {/* Header */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold">Messages</h2>
//             <FontAwesomeIcon icon={faEdit} className="text-gray-600 cursor-pointer hover:text-gray-800" />
//           </div>
          
//           {/* Search */}
//           <div className="relative">
//             <FontAwesomeIcon 
//               icon={faSearch} 
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
//             />
//             <input
//               type="text"
//               placeholder="Search users..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Search Results */}
//         {searchQuery && (
//           <div className="flex-1 overflow-y-auto">
//             {isSearching ? (
//               <div className="p-4 text-center">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
//               </div>
//             ) : searchResults.length > 0 ? (
//               searchResults.map(searchUser => (
//                 <div
//                   key={searchUser._id}
//                   className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
//                   onClick={() => startConversation(searchUser)}
//                 >
//                   <img
//                     src={searchUser.profilePic}
//                     alt={searchUser.name}
//                     className="w-12 h-12 rounded-full object-cover mr-3"
//                   />
//                   <div>
//                     <h4 className="font-medium">{searchUser.name}</h4>
//                     <p className="text-sm text-gray-600">@{searchUser.username}</p>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="p-4 text-center text-gray-500">
//                 No users found
//               </div>
//             )}
//           </div>
//         )}

//         {/* Conversations */}
//         {!searchQuery && (
//           <div className="flex-1 overflow-y-auto">
//             {conversations.length > 0 ? (
//               conversations.map(conversation => {
//                 const displayName = getConversationDisplayName(conversation);
//                 const displayPicture = getConversationDisplayPicture(conversation);
//                 const unreadCount = unreadCounts[conversation.conversationId] || 0;
//                 const otherParticipant = conversation.participants.find(p => p._id !== user._id);
//                 const isOnline = otherParticipant && isUserOnline(otherParticipant._id);

//                 return (
//                   <div
//                     key={conversation.conversationId}
//                     className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
//                       selectedConversation?.conversationId === conversation.conversationId 
//                         ? 'bg-blue-50 border-r-2 border-blue-500' 
//                         : ''
//                     }`}
//                     onClick={() => selectConversation(conversation)}
//                   >
//                     <div className="relative">
//                       <img
//                         src={displayPicture}
//                         alt={displayName}
//                         className="w-12 h-12 rounded-full object-cover mr-3"
//                       />
//                       {isOnline && (
//                         <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                       )}
//                     </div>
                    
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between">
//                         <h4 className="font-medium truncate">{displayName}</h4>
//                         <span className="text-xs text-gray-500">
//                           {formatTime(conversation.updatedAt)}
//                         </span>
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm text-gray-600 truncate">
//                           {conversation.lastMessage || 'No messages yet'}
//                         </p>
//                         {unreadCount > 0 && (
//                           <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
//                             {unreadCount > 99 ? '99+' : unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="p-8 text-center text-gray-500">
//                 <FontAwesomeIcon icon={faComment} className="text-4xl mb-4" />
//                 <p>No conversations yet</p>
//                 <p className="text-sm">Search for users to start chatting</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Chat Area */}
//       <div className={`${isMobile && !selectedConversation ? 'hidden' : 'flex'} flex-col flex-1`}>
//         {selectedConversation ? (
//           <>
//             {/* Chat Header */}
//             <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
//               <div className="flex items-center">
//                 {isMobile && (
//                   <FontAwesomeIcon
//                     icon={faArrowLeft}
//                     className="mr-3 cursor-pointer"
//                     onClick={() => setSelectedConversation(null)}
//                   />
//                 )}
                
//                 <div className="relative">
//                   <img
//                     src={getConversationDisplayPicture(selectedConversation)}
//                     alt={getConversationDisplayName(selectedConversation)}
//                     className="w-10 h-10 rounded-full object-cover mr-3"
//                   />
//                   {selectedConversation.conversationType === 'private' && (
//                     (() => {
//                       const otherParticipant = selectedConversation.participants.find(p => p._id !== user._id);
//                       return otherParticipant && isUserOnline(otherParticipant._id) ? (
//                         <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                       ) : null;
//                     })()
//                   )}
//                 </div>
                
//                 <div>
//                   <h3 className="font-medium">{getConversationDisplayName(selectedConversation)}</h3>
//                   <p className="text-sm text-gray-600">
//                     {(() => {
//                       const typingUsers = getTypingUsers(selectedConversation.conversationId);
//                       if (typingUsers.length > 0) {
//                         return `${typingUsers.map(u => u.name).join(', ')} typing...`;
//                       }
                      
//                       if (selectedConversation.conversationType === 'private') {
//                         const otherParticipant = selectedConversation.participants.find(p => p._id !== user._id);
//                         return otherParticipant && isUserOnline(otherParticipant._id) ? 'Online' : 'Offline';
//                       }
                      
//                       return `${selectedConversation.participants.length} members`;
//                     })()}
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-3">
//                 <FontAwesomeIcon icon={faPhone} className="text-gray-600 cursor-pointer hover:text-gray-800" />
//                 <FontAwesomeIcon icon={faVideo} className="text-gray-600 cursor-pointer hover:text-gray-800" />
//                 <FontAwesomeIcon 
//                   icon={faEllipsisV} 
//                   className="text-gray-600 cursor-pointer hover:text-gray-800"
//                   onClick={() => setShowConversationInfo(!showConversationInfo)}
//                 />
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//               {getMessagesForConversation(selectedConversation.conversationId).map(message => (
//                 <div
//                   key={message._id}
//                   className={`flex mb-4 ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
//                 >
//                   {message.sender._id !== user._id && (
//                     <img
//                       src={message.sender.profilePic}
//                       alt={message.sender.name}
//                       className="w-8 h-8 rounded-full object-cover mr-2 self-end"
//                     />
//                   )}
                  
//                   <div className={`max-w-xs lg:max-w-md ${message.sender._id === user._id ? 'order-1' : 'order-2'}`}>
//                     <div
//                       className={`px-4 py-2 rounded-lg ${
//                         message.sender._id === user._id
//                           ? 'bg-blue-500 text-white ml-auto'
//                           : 'bg-white text-gray-800 border'
//                       }`}
//                     >
//                       {message.messageType === 'image' && message.attachments && (
//                         <div className="mb-2">
//                           {message.attachments.map((attachment, index) => (
//                             <img
//                               key={index}
//                               src={attachment.url}
//                               alt="Attachment"
//                               className="max-w-full h-auto rounded"
//                             />
//                           ))}
//                         </div>
//                       )}
                      
//                       {message.messageType === 'file' && message.attachments && (
//                         <div className="mb-2">
//                           {message.attachments.map((attachment, index) => (
//                             <div key={index} className="flex items-center p-2 bg-gray-100 rounded">
//                               <FontAwesomeIcon icon={faFile} className="mr-2" />
//                               <span className="text-sm">{attachment.originalName}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
                      
//                       <p className="break-words">{message.content}</p>
//                     </div>
                    
//                     <div className={`flex items-center mt-1 text-xs text-gray-500 ${
//                       message.sender._id === user._id ? 'justify-end' : 'justify-start'
//                     }`}>
//                       <span>{formatTime(message.createdAt)}</span>
//                       {getMessageStatusIcon(message) && (
//                         <span className="ml-1">{getMessageStatusIcon(message)}</span>
//                       )}
//                     </div>
//                   </div>
                  
//                   {message.sender._id === user._id && (
//                     <div className="flex flex-col space-y-1 ml-2 self-end">
//                       <FontAwesomeIcon
//                         icon={faEdit}
//                         className="text-gray-400 cursor-pointer hover:text-gray-600 text-xs"
//                         onClick={() => {
//                           setEditingMessage(message);
//                           setMessageInput(message.content);
//                         }}
//                       />
//                       <FontAwesomeIcon
//                         icon={faTrash}
//                         className="text-gray-400 cursor-pointer hover:text-red-500 text-xs"
//                         onClick={() => handleDeleteMessage(message._id, false)}
//                       />
//                     </div>
//                   )}
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input */}
//             <div className="p-4 border-t border-gray-200 bg-white">
//               {selectedFiles.length > 0 && (
//                 <div className="mb-2 flex flex-wrap gap-2">
//                   {selectedFiles.map((file, index) => (
//                     <div key={index} className="flex items-center bg-gray-100 rounded p-2">
//                       <span className="text-sm truncate max-w-[100px]">{file.name}</span>
//                       <button
//                         onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
//                         className="ml-2 text-red-500 hover:text-red-700"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
              
//               {editingMessage && (
//                 <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
//                   <p className="text-sm text-yellow-800">Editing message</p>
//                   <button
//                     onClick={() => {
//                       setEditingMessage(null);
//                       setMessageInput('');
//                     }}
//                     className="text-yellow-600 hover:text-yellow-800 text-sm"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               )}
              
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="p-2 text-gray-600 hover:text-gray-800"
//                   disabled={isUploading}
//                 >
//                   <FontAwesomeIcon icon={faImage} />
//                 </button>
                
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   accept="image/*,video/*,.pdf,.doc,.docx"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
                
//                 <div className="flex-1 relative">
//                   <input
//                     type="text"
//                     value={messageInput}
//                     onChange={(e) => handleTyping(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
//                     placeholder="Type a message..."
//                     className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
//                     disabled={isUploading}
//                   />
//                 </div>
                
//                 <button
//                   onClick={handleSendMessage}
//                   disabled={(!messageInput.trim() && selectedFiles.length === 0) || isUploading}
//                   className={`p-2 rounded-full ${
//                     (messageInput.trim() || selectedFiles.length > 0) && !isUploading
//                       ? 'bg-blue-500 text-white hover:bg-blue-600'
//                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   {isUploading ? (
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   ) : (
//                     <FontAwesomeIcon icon={faPaperPlane} />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-50">
//             <div className="text-center">
//               <FontAwesomeIcon icon={faComment} className="text-6xl text-gray-300 mb-4" />
//               <h3 className="text-xl font-medium text-gray-600 mb-2">No conversation selected</h3>
//               <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Messages;



import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/socketContext.jsx';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/chatAPI';
import ConversationList from '../components/Chat/ConversationList';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageArea from '../components/Chat/MessageArea';
import MessageInput from '../components/Chat/MessageInput';
import UserSearch from '../components/Chat/UserSearch';
import LoadingSpinner from '../utils/LoadingSpinner';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const { user } = useAuth();
    const { convoId } = useParams();
    const {
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        getMessagesForConversation,
        setMessagesForConversation,
        unreadCounts
    } = useSocket();

    // Load conversations on component mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            console.log("selectedConversation", selectedConversation);
            loadMessages(selectedConversation.conversationId);
            joinRoom(selectedConversation.conversationId);
            
            return () => {
                leaveRoom(selectedConversation.conversationId);
            };
        }
    }, [selectedConversation]);

    // Listen for new messages via socket
    useEffect(() => {
        if (selectedConversation) {
            const conversationMessages = getMessagesForConversation(selectedConversation._id);
            setMessages(conversationMessages);
        }
    }, [getMessagesForConversation, selectedConversation]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.conversation.getUserConversations();
            setConversations(response.conversations || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            const response = await chatAPI.message.getConversationMessages(conversationId);
            const messagesData = response.messages || [];
            setMessages(messagesData);
            setMessagesForConversation(conversationId, messagesData);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleConversationSelect = (conversation) => {
        if (selectedConversation?._id) {
            leaveRoom(selectedConversation._id);
        }
        setSelectedConversation(conversation);
        setShowUserSearch(false);
    };

    const handleNewConversation = async (selectedUser) => {
        try {
            // Check if conversation already exists
            const existingConversation = conversations.find(conv => 
                conv.participants.some(p => p._id === selectedUser._id)
            );

            if (existingConversation) {
                setSelectedConversation(existingConversation);
                setShowUserSearch(false);
                return;
            }

            // Create new conversation
            const response = await chatAPI.conversation.createConversation({
                participants: [selectedUser._id],
                type: 'private'
            });

            const newConversation = response.conversation;
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversation(newConversation);
            setShowUserSearch(false);
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleSendMessage = async (content, messageType = 'text') => {
        if (!selectedConversation || !content.trim()) return;

        try {
            const messageData = {
                conversationId: selectedConversation._id,
                content: content.trim(),
                messageType
            };

            const response = await chatAPI.message.sendMessage(messageData);
            
            // The message will be added via socket event
            // Update conversation list to move this conversation to top
            setConversations(prev => {
                const updatedConversations = prev.filter(c => c._id !== selectedConversation._id);
                return [selectedConversation, ...updatedConversations];
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleBackToConversations = () => {
        setSelectedConversation(null);
        setShowUserSearch(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Left Sidebar - Conversations List */}
            <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-300`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{user?.name}</h2>
                            <button
                                onClick={() => setShowUserSearch(!showUserSearch)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Search Input */}
                        <div className="mt-3">
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors"
                            />
                        </div>
                    </div>

                    {/* User Search or Conversations */}
                    {showUserSearch ? (
                        <UserSearch 
                            onSelectUser={handleNewConversation}
                            onClose={() => setShowUserSearch(false)}
                        />
                    ) : (
                        <ConversationList
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            onSelectConversation={handleConversationSelect}
                            currentUser={user}
                            searchQuery={searchQuery}
                            unreadCounts={unreadCounts}
                        />
                    )}
                </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
                {selectedConversation ? (
                    <>
                        <ChatHeader 
                            conversation={selectedConversation}
                            currentUser={user}
                            onBack={handleBackToConversations}
                        />
                        <MessageArea
                            messages={messages}
                            currentUser={user}
                            conversation={selectedConversation}
                        />
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            disabled={!isConnected}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                            <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;