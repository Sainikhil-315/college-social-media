import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link  } from 'react-router-dom';
import { userAPI } from '../api/user';
import { toast } from 'react-toastify';

const Profile = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { userId } = useParams(); // from URL: /profile/:userId
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                setError("User ID is missing");
                setLoading(false);
                return;
            }
            
            try {
                // console.log("Fetching profile for user ID:", userId);
                const data = await userAPI.getUserProfile(userId);
                // console.log("Received user data:", data);
                
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

    const getFollowers = async () => {
        const data = await userAPI.getFollowers(userId);
        // console.log(location.pathname);
        nav(location.pathname + '/followers');
    }

    if (loading) return <div className="text-center mt-10">Loading profile...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
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
                        <p className='mt-2'>bio</p>
                        <p className="text-sm text-gray-700">{user.bio || "No bio available"}</p>
                    </div>
                    <div className="flex gap-6 mt-4 text-sm">
                        <span><strong>{user.postsCount || 0}</strong> Posts</span>
                        <span onClick={getFollowers}><strong>{user.followers?.length || 0}</strong> Followers</span>
                        <span><strong>{user.following?.length || 0}</strong> Following</span>
                    </div>
                </div>
                <div>
                    <button className='rounded border-2 p-1 bg-blue-600 border-blue-300 '>Update Bio</button>
                </div>
            </div>

            <hr className="my-6" />

            <div>
                <h3 className="text-lg font-semibold mb-4">Posts</h3>
                {user.posts?.length ? (
                    <div className="grid grid-cols-3 gap-3">
                        {user.posts.map(post => (
                            <Link to={`/post/${post._id}`} key={post._id}>
                            <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
                                <img
                                    src={post.image || 'https://via.placeholder.com/150'}
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
        </div>
    );
};

export default Profile;