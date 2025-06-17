import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import Create from "../pages/Create"; // This should be your modal component

const Sidebar = () => {
  const navigate = useNavigate();
  const path = window.location.pathname;
  const initialActiveItem = path.split("/")[1] || "home";

  const [activeItem, setActiveItem] = useState(initialActiveItem);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { logout, user } = useAuth();

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);

    switch (itemName) {
      case "home":
      case "search":
      case "explore":
      case "reels":
      case "messages":
      case "notifications":
        navigate(`/${itemName}`);
        break;
      case "create":
        setIsModalOpen(true); // open modal here
        break;
      case "profile":
        const currentUserId = user?._id || user?.id || "me";
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

    switch (optionName) {
      case "settings":
        navigate("/settings");
        break;
      case "activity":
        navigate("/activity");
        break;
      case "saved":
        navigate("/saved");
        break;
      case "logout":
        logout();
        navigate("/register");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="left-0 top-0 h-screen w-[250px] bg-white border-r border-gray-300 p-4 flex flex-col">
        <div className="flex-grow">
          <p className="text-xl font-bold pl-4 mb-8">College Media</p>

          <nav>
            {[
              { name: "home", icon: faHome },
              { name: "search", icon: faSearch },
              { name: "explore", icon: faCompass },
              { name: "reels", icon: faFilm },
              { name: "messages", icon: faComment },
              { name: "notifications", icon: faHeart },
            ].map(({ name, icon }) => (
              <div
                key={name}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer 
                  hover:bg-gray-100 transition-colors duration-200
                  ${activeItem === name ? "font-bold bg-gray-100" : ""}
                `}
                onClick={() => handleItemClick(name)}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`mr-4 ${
                    activeItem === name ? "text-black" : "text-gray-600"
                  }`}
                  size="lg"
                />
                <span className="capitalize">{name}</span>
              </div>
            ))}

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
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-5 h-5 mr-4 rounded-full object-cover"
              />
              <span>Profile</span>
            </div>
          </nav>
        </div>

        {/* More Options */}
        <div className="relative">
          <div
            className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={handleMoreClick}
          >
            <FontAwesomeIcon icon={faEllipsisH} className="mr-4" size="lg" />
            <span>More</span>
          </div>

          {isMoreOptionsOpen && (
            <div
              className="absolute bottom-full left-0 w-full bg-white 
              border border-gray-200 rounded-lg shadow-lg mb-2"
            >
              {[
                { name: "settings", icon: faCog },
                { name: "activity", icon: faArchive },
                { name: "saved", icon: faBookmark },
                { name: "logout", icon: faSignOutAlt },
              ].map(({ name, icon }) => (
                <div
                  key={name}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => handleMoreOptionClick(name)}
                >
                  <FontAwesomeIcon icon={icon} className="mr-4" />
                  <span className="capitalize">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && <Create isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Sidebar;
