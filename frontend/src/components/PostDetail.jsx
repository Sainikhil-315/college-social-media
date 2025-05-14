import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { postAPI } from "../api/post";
import { Heart, MessageCircle, Bookmark, Send, MoreHorizontal, X, Trash2 } from "lucide-react";
// Assuming you have an AuthContext for current user info - modify as needed
import { useAuth } from '../context/AuthContext';


const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Replace with your actual auth context
  // const { currentUser } = useContext(AuthContext);
  // Temporary user ID for demo purposes - replace with actual auth
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || 'me';
  console.log(currentUserId);
  
  const currentUser = { _id: currentUserId };
  
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const data = await postAPI.getPostById(postId);
        setPost(data);
        
        // Check if current user has liked the post
        // This fix ensures the heart is filled if user already liked the post
        if (data.likes && Array.isArray(data.likes)) {
          // Check if likes array includes the current user's ID
          const userLiked = data.likes.some(likeId => 
            likeId === currentUser._id || 
            (typeof likeId === 'object' && likeId?._id === currentUser._id)
          );
          console.log("User liked post:", userLiked);
          setIsLiked(userLiked);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUser._id]);

  const handleLike = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Debug: Log the exact endpoint being called
      console.log("Attempting to call API with postId:", postId);
      
      if (isLiked) {
        // Implement optimistic UI update first
        setIsLiked(false);
        setPost(prev => ({
          ...prev,
          likes: prev.likes.filter(id => id !== currentUser._id)
        }));
        
        // Then call the API
        await postAPI.unlikePost(postId);
      } else {
        // Implement optimistic UI update first
        setIsLiked(true);
        setPost(prev => ({
          ...prev,
          likes: [...prev.likes, currentUser._id]
        }));
        
        // Then call the API
        await postAPI.likePost(postId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert UI changes on error
      setIsLiked(!isLiked);
      setPost(prev => {
        // If we failed to unlike, add the ID back to likes
        if (isLiked) {
          return {
            ...prev,
            likes: [...prev.likes, currentUser._id]
          };
        } 
        // If we failed to like, remove the ID from likes
        else {
          return {
            ...prev,
            likes: prev.likes.filter(id => id !== currentUser._id)
          };
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Implement save functionality if you have it in your API
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await postAPI.commentOnPost(postId, comment);
      // Assuming the API returns the updated post or at least the new comment
      const newComment = response.comment || {
        _id: Date.now().toString(), // Temporary ID if API doesn't return it
        text: comment,
        user: {
          _id: currentUser._id,
          name: currentUser.name || "Current User" // Replace with actual user name
        }
      };
      
      setPost(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
      setComment("");
      setShowAllComments(true); // Show all comments after adding a new one
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await postAPI.deleteComment(postId, commentId);
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId)
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await postAPI.deletePost(postId);
      // Redirect to homepage or posts list after deleting
      window.history.back();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "recently";
    
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString();
  };

  // Fixed logic to determine if current user can delete the post
  const canDeletePost = () => {
    if (!post || !post.user) return false;
    
    // Check if the post's user id matches the current user id
    if (typeof post.user === 'object') {
      return post.user?._id === currentUser._id;
    } else {
      return post.user === currentUser._id;
    }
  };
  
  const canDeleteComment = (comment) => {
    if (!comment || !post) return false;
    
    // Check if current user is the commenter
    const isCommenter = comment.user?._id === currentUser._id;
    
    // Check if current user is the post owner
    const isPostOwner = post.user?._id === currentUser._id;
    
    return isCommenter || isPostOwner;
  };
  
  if (!post) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  // Get only the first 2 comments if not showing all
  const displayedComments = showAllComments 
    ? post.comments 
    : post.comments.slice(0, 2);

  // Debug: Log the post owner and current user for comparison
  console.log("Post user:", post.user);
  console.log("Current user:", currentUser);
  console.log("Can delete post:", canDeletePost());

  return (
    <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-sm">
      {/* Header with user info */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 mr-3">
            <img
              src={post.user.profilePic}
              alt={post.user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{post.user.name}</p>
            <p className="text-xs text-gray-500">{post.user.regd_no}</p>
          </div>
        </div>
        {/* Three dots menu - Always visible now but options depend on permissions */}
        <div className="relative">
          <button 
            className="text-gray-700 focus:outline-none" 
            onClick={() => setShowOptions(!showOptions)}
          >
            <MoreHorizontal size={20} />
          </button>
          
          {/* Options dropdown */}
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              {/* Delete option only shown if user can delete */}
              {canDeletePost() && (
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setShowOptions(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete post
                </button>
              )}
              <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowOptions(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Image */}
      <div className="w-full relative pb-[100%]">
        <img
          src={post.image}
          alt="Post"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button 
              onClick={handleLike} 
              className="focus:outline-none"
              disabled={isLoading}
            >
              <Heart 
                size={24} 
                fill={isLiked ? "#ed4956" : "none"} 
                stroke={isLiked ? "#ed4956" : "currentColor"} 
              />
            </button>
            <button 
              className="focus:outline-none"
              onClick={() => {
                // Focus on comment input when clicking comment icon
                document.getElementById("comment-input").focus();
              }}
            >
              <MessageCircle size={24} />
            </button>
            <button className="focus:outline-none">
              <Send size={24} />
            </button>
          </div>
          <button onClick={handleSave} className="focus:outline-none">
            <Bookmark size={24} fill={isSaved ? "black" : "none"} />
          </button>
        </div>

        {/* Likes count */}
        <p className="font-semibold text-sm mb-1">
          {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
        </p>

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm mr-2">{post.user.name}</span>
          <span className="text-sm">{post.description || "No description"}</span>
        </div>

        {/* Post time */}
        <p className="text-xs text-gray-500 uppercase mb-3">{formatTimeAgo(post.createdAt)}</p>

        {/* Comments section */}
        <div className="max-h-60 overflow-y-auto">
          {post.comments.length > 0 ? (
            <div className="space-y-2">
              {displayedComments.map((comment) => (
                <div key={comment._id} className="flex justify-between items-start">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{comment.user?.name || "User"}</span>
                    {comment.text}
                  </p>
                  {canDeleteComment(comment) && (
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-500 hover:text-red-500 ml-2 focus:outline-none"
                      disabled={isLoading}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Show more comments button */}
              {post.comments.length > 2 && !showAllComments && (
                <button 
                  onClick={() => setShowAllComments(true)}
                  className="text-gray-500 text-sm mt-1 focus:outline-none"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No comments yet</p>
          )}
        </div>

        {/* Comment input */}
        <form onSubmit={handleAddComment} className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <input
              id="comment-input"
              type="text"
              placeholder="Add a comment..."
              className="flex-grow text-sm focus:outline-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`text-blue-500 font-semibold text-sm ${(!comment.trim() || isLoading) ? 'opacity-50' : 'opacity-100'}`}
              disabled={!comment.trim() || isLoading}
            >
              Post
            </button>
          </div>
        </form>
      </div>
      
      {/* Delete Post Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-80 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-center">Delete Post</h3>
            </div>
            <div className="p-4">
              <p className="text-center">Are you sure you want to delete this post? This action cannot be undone.</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button 
                className="w-1/2 p-3 text-center font-medium border-r border-gray-200 text-gray-700"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="w-1/2 p-3 text-center font-medium text-red-600"
                onClick={handleDeletePost}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;