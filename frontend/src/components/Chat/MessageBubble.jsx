import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckDouble,
  faEdit,
  faTrash,
  faFile,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { chatAPI } from "../../api/chatAPI";

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  isGrouped = false,
  isLastInGroup = true,
  conversation,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwnMessage = isOwn;

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Message status icon
  const getMessageStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.status) {
      case "sent":
        return (
          <FontAwesomeIcon icon={faCheck} className="text-gray-400 text-xs" />
        );
      case "delivered":
        return (
          <FontAwesomeIcon
            icon={faCheckDouble}
            className="text-gray-400 text-xs"
          />
        );
      case "read":
        return (
          <FontAwesomeIcon
            icon={faCheckDouble}
            className="text-blue-500 text-xs"
          />
        );
      default:
        return null;
    }
  };

  // Handle edit message
  const handleEditMessage = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await chatAPI.message.editMessage(message._id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (deleteForEveryone = false) => {
    try {
      await chatAPI.message.deleteMessage(message._id, deleteForEveryone);
      setShowActions(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle key press in edit mode
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditMessage();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  return (
    <div
      className={`flex mb-${isLastInGroup ? "4" : "1"} ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Sender Avatar (only for other users and only on last message in group) */}
      {!isOwnMessage && isLastInGroup && (
        <img
          src={message.sender.profilePic}
          alt={message.sender.name}
          className="w-8 h-8 rounded-full object-cover mr-2 self-end"
        />
      )}

      {/* Spacer for grouped messages */}
      {!isOwnMessage && !isLastInGroup && <div className="w-8 mr-2"></div>}

      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-1" : ""}`}>
        <div
          className={`relative group ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`inline-block px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
              isOwnMessage
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-900 rounded-bl-none"
            }`}
            onDoubleClick={() => isOwnMessage && setIsEditing(true)}
          >
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-2 border rounded text-black text-sm resize-none focus:outline-none"
                rows={3}
                autoFocus
              />
            ) : (
              <>{message.content}</>
            )}
          </div>

          {/* Message actions (Edit/Delete) */}
          {isOwnMessage && (
            <div className="absolute top-0 right-0 mt-[-0.5rem] mr-[-0.5rem] hidden group-hover:flex space-x-2 z-10">
              <button
                className="text-white text-xs bg-gray-600 p-1 rounded hover:bg-gray-700"
                onClick={() => setShowActions(!showActions)}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </button>
            </div>
          )}

          {/* Action Menu */}
          {showActions && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white border shadow-md rounded z-20">
              <button
                onClick={() => setIsEditing(true)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteMessage(false)}
                className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete
              </button>
            </div>
          )}

          {/* Time + Status */}
          <div
            className={`mt-1 flex items-center ${
              isOwnMessage ? "justify-end" : "justify-start"
            } space-x-1 text-xs text-gray-500`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {getMessageStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MessageBubble;
