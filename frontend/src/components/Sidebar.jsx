import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSearch, 
  faCompass, 
  faFilm, 
  faComment, 
  faHeart, 
  faPlusSquare, 
  faUser, 
  faEllipsisH,
  faCog,
  faArchive,
  faBookmark,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  // Determine active item based on current path
  const path = window.location.pathname;
  const initialActiveItem = path.split('/')[1] || 'home';
  
  const [activeItem, setActiveItem] = useState(initialActiveItem);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const { logout, user } = useAuth();
  
  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
    
    switch(itemName) {
      case 'home':
        navigate('/home');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'explore':
        navigate('/explore');
        break;
      case 'reels':
        navigate('/reels');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'create':
        navigate('/create');
        break;
      case 'profile':
        // Get the current user ID from auth context
        const currentUserId = user?._id || user?.id || 'me'; // Use user ID from context or fallback to 'me'
        navigate(`/profile/${currentUserId}`);
        break;
      default:
        break;
    }
  };

  const handleMoreClick = () => {
    setIsMoreOptionsOpen(!isMoreOptionsOpen);
  };

  const handleMoreOptionClick = (optionName) => {
    setIsMoreOptionsOpen(false);
    
    switch(optionName) {
      case 'settings':
        navigate('/settings');
        break;
      case 'activity':
        navigate('/activity');
        break;
      case 'saved':
        navigate('/saved');
        break;
      case 'logout':
        // Handle logout and redirect to register page
        logout();
        navigate('/register');
        break;
      default:
        break;
    }
  };

  return (
    <div className="left-0 top-0 h-screen w-[250px] bg-white border-r border-gray-300 p-4 flex flex-col">
      <div className="flex-grow">
        <p className="text-xl font-bold pl-4 mb-8">College media</p>

        <nav>
          {/* Home */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "home" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("home")}
          >
            <FontAwesomeIcon
              icon={faHome}
              className={`mr-4 ${
                activeItem === "home" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Home</span>
          </div>

          {/* Search */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "search" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("search")}
          >
            <FontAwesomeIcon
              icon={faSearch}
              className={`mr-4 ${
                activeItem === "search" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Search</span>
          </div>

          {/* Explore */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "explore" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("explore")}
          >
            <FontAwesomeIcon
              icon={faCompass}
              className={`mr-4 ${
                activeItem === "explore" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Explore</span>
          </div>

          {/* Reels */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "reels" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("reels")}
          >
            <FontAwesomeIcon
              icon={faFilm}
              className={`mr-4 ${
                activeItem === "reels" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Reels</span>
          </div>

          {/* Messages */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "messages" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("messages")}
          >
            <FontAwesomeIcon
              icon={faComment}
              className={`mr-4 ${
                activeItem === "messages" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Messages</span>
          </div>

          {/* Notifications */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "notifications" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("notifications")}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className={`mr-4 ${
                activeItem === "notifications" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Notifications</span>
          </div>

          {/* Create */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "create" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("create")}
          >
            <FontAwesomeIcon
              icon={faPlusSquare}
              className={`mr-4 ${
                activeItem === "create" ? "text-black" : "text-gray-600"
              }`}
              size="lg"
            />
            <span>Create</span>
          </div>

          {/* Profile */}
          <div
            className={`
              flex items-center p-3 rounded-lg cursor-pointer 
              hover:bg-gray-100 transition-colors duration-200
              ${activeItem === "profile" ? "font-bold bg-gray-100" : ""}
            `}
            onClick={() => handleItemClick("profile")}
          >
            <img src={user.profilePic} className='w-5 h-5 mr-4 rounded-full object-cover'></img>
            <span>Profile</span>
          </div>
        </nav>
      </div>

      <div className="relative">
        {/* More Button */}
        <div
          className="
            flex items-center p-3 rounded-lg cursor-pointer 
            hover:bg-gray-100 transition-colors duration-200
          "
          onClick={handleMoreClick}
        >
          <FontAwesomeIcon icon={faEllipsisH} className="mr-4" size="lg" />
          <span>More</span>
        </div>

        {/* More Options Dropdown */}
        {isMoreOptionsOpen && (
          <div
            className="
              absolute bottom-full left-0 w-full bg-white 
              border border-gray-200 rounded-lg shadow-lg
              mb-2
            "
          >
            {/* Settings */}
            <div
              className="
                flex items-center p-3 hover:bg-gray-100 
                cursor-pointer transition-colors duration-200
              "
              onClick={() => handleMoreOptionClick("settings")}
            >
              <FontAwesomeIcon icon={faCog} className="mr-4" />
              <span>Settings</span>
            </div>

            {/* Your Activity */}
            <div
              className="
                flex items-center p-3 hover:bg-gray-100 
                cursor-pointer transition-colors duration-200
              "
              onClick={() => handleMoreOptionClick("activity")}
            >
              <FontAwesomeIcon icon={faArchive} className="mr-4" />
              <span>Your Activity</span>
            </div>

            {/* Saved */}
            <div
              className="
                flex items-center p-3 hover:bg-gray-100 
                cursor-pointer transition-colors duration-200
              "
              onClick={() => handleMoreOptionClick("saved")}
            >
              <FontAwesomeIcon icon={faBookmark} className="mr-4" />
              <span>Saved</span>
            </div>

            {/* Logout */}
            <div
              className="
                flex items-center p-3 hover:bg-gray-100 
                cursor-pointer transition-colors duration-200
              "
              onClick={() => handleMoreOptionClick("logout")}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-4" />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;