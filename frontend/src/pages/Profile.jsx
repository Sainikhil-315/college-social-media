import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { userAPI } from "../api/user";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user: authUser } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const { userId } = useParams(); // from URL: /profile/:userId

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await userAPI.getUserProfile(userId);

        if (data && data.success && data.user) {
          setUser(data.user);
        } else {
          setError("Invalid user data received");
        }
        setLoading(false);
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error.message || "Failed to load user profile");
        setError(error.message || "Failed to load user profile");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);
  
  console.log(user);
  
  const updateBio = () => {
    setBioInput(user.bio || "");
    setIsModalOpen(true);
  };

  const handleFollow = async () => {
    try {
      const followUser = await userAPI.followUser(userId);
      console.log("Following user", userId);
      toast.success("Successfully followed user");
      // Force refresh to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Follow user error:", error);
      toast.error(error.message || "Failed to follow user");
    }
  };

  const handleUnFollow = async () => {
    try {
      const unfollowUser = await userAPI.unfollowUser(userId);
      console.log("Unfollowing user", userId);
      toast.success("Successfully unfollowed user");
      // Force refresh to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Unfollow user error:", error);
      toast.error(error.message || "Failed to unfollow user");
    }
  };

  const handleBioUpdate = async () => {
    setUpdating(true);
    try {
      const updated = await userAPI.updateUserProfile({ bio: bioInput });
      setUser((prev) => ({ ...prev, bio: updated.user.bio }));
      toast.success("Bio updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update bio");
    } finally {
      setUpdating(false);
    }
  };

  const getFollowers = async () => {
    await userAPI.getFollowers(userId);
    nav(location.pathname + "/followers");
  };

  const getFollowing = async () => {
    await userAPI.getFollowing(userId);
    nav(location.pathname + "/following");
  };

  // Function to check if current user is following the profile user
  const isFollowing = () => {
    if (!authUser || !authUser.following) return false;
    return authUser.following.includes(userId);
  };

  if (loading)
    return <div className="text-center mt-10">Loading profile...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  if (!user) return <div className="text-center mt-10">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt={user.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <span className="text-gray-600 text-sm">@{user.regd_no}</span>
          </div>
          <div>
            <p className="mt-2">Bio</p>
            <p className="text-sm text-gray-700">
              {user.bio || "No bio available"}
            </p>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <span>
              <strong>{user.postsCount || 0}</strong> Posts
            </span>
            <span onClick={getFollowers} className="cursor-pointer">
              <strong>{user.followers?.length || 0}</strong> Followers
            </span>
            <span onClick={getFollowing} className="cursor-pointer">
              <strong>{user.following?.length || 0}</strong> Following
            </span>
          </div>
        </div>
        {userId === authUser._id ? (
          <button
            onClick={updateBio}
            className="rounded-2xl p-1 px-3 bg-blue-600 border-blue-300 text-white"
          >
            Update Bio
          </button>
        ) : (
          <div className="flex gap-2">
            {!isFollowing() ? (
              <>
                <button
                  onClick={handleFollow}
                  className="rounded border-2 p-1 px-3 bg-blue-600 border-blue-300 text-white"
                >
                  Follow
                </button>
                <button className="rounded border-2 p-1 px-3 bg-gray-700 border-gray-500 text-white">
                  Message
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUnFollow}
                  className="rounded border-2 p-1 px-3 bg-red-600 border-red-300 text-white"
                >
                  Unfollow
                </button>
                <button className="rounded border-2 p-1 px-3 bg-gray-700 border-gray-500 text-white">
                  Message
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <hr className="my-6" />

      <div>
        <h3 className="text-lg font-semibold mb-4">Posts</h3>
        {user.posts?.length ? (
          <div className="grid grid-cols-3 gap-3">
            {user.posts.map((post) => (
              <Link to={`/post/${post._id}`} key={post._id}>
                <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
                  <img
                    src={post.image || "https://via.placeholder.com/150"}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No posts yet.</p>
        )}
      </div>

      {/* Bio Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 opacity-100 bg-black flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h3 className="text-xl font-semibold mb-4">Update Bio</h3>
            <textarea
              rows="4"
              className="w-full border border-gray-300 p-2 rounded mb-4"
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleBioUpdate}
                disabled={updating}
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;