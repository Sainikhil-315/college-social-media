import React, { useEffect, useState } from "react";
import { Users, UserMinus, ChevronRight, Heart } from "lucide-react";
import { userAPI } from "../api/user";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";

const Following = () => {
  // Your existing API logic goes here
  const [following, setFollowing] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  // Replace this with your actual API call

  const { userId } = useParams();
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const { following: newFollowing } = await userAPI.getFollowing(userId);
        if (JSON.stringify(newFollowing) !== JSON.stringify(following)) {
          setFollowing(newFollowing);
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, [userId]);

  const handleRemove = async (followingId, e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      setRemovingId(followingId);

      // Add your remove API call here
      const unfollowUser = await userAPI.unfollowUser(followingId);
      console.log("Unfollowing user", followingId);
      toast.success("Successfully unfollowed user");
      setTimeout(() => {
        setFollowing((prev) => prev.filter((user) => user._id !== followingId));
        setRemovingId(null);
      }, 1000);
    } catch (error) {
      console.error("Unfollow user error:", error);
      toast.error(error.message || "Failed to unfollow user");
    }
  };
  const nav = useNavigate();
  // const handleRedirect = (userId) => {
  //   console.log('redirecting');
  //   console.log(userId)
  //   // nav('/profile' + `${userId}`);
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Following
          </h1>
          <p className="text-gray-600 text-lg">
            {following.length} amazing people you're connected with
          </p>
        </div>

        {/* Stats Section */}
        {following.length > 0 && (
          <div className="mt-12 mb-5 bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div>
              <div>
                <h4 className="text-2xl font-bold text-purple-600">
                  {following.length}
                </h4>
                <p className="text-gray-600 font-medium">Following</p>
              </div>
              {/* <div>
                <h4 className="text-2xl font-bold text-blue-600">{Math.floor(following.length * 1.2)}</h4>
                <p className="text-gray-600 font-medium">Connections</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-indigo-600">{Math.floor(following.length * 0.8)}</h4>
                <p className="text-gray-600 font-medium">Active</p>
              </div> */}
            </div>
          </div>
        )}

        {/* Following List */}
        {following.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              No Following Yet
            </h3>
            <p className="text-gray-400">
              Start following people to see them here!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {following.map((user, index) => (
              <Link
                to={`/profile/${user._id}`}
                key={user._id}
                className="group block cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  /* Add your navigation logic here: navigate(`/profile/${user._id}`) */
                }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-white/20 animate-fade-in-up">
                  {/* Profile Section */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-purple-600 transition-colors duration-300">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {user.regd_no}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => handleRemove(user._id, e)}
                    disabled={removingId === user._id}
                    className={`
                      w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2
                      ${
                        removingId === user._id
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 hover:shadow-md active:scale-95"
                      }
                    `}
                  >
                    {removingId === user._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Unfollow</span>
                      </>
                    )}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Following;
