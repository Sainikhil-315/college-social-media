const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    likePost,
    unlikePost,
    commentOnPost,
    deleteComment,
    getUserPosts
} = require("../../controllers/postController");

// Create a new post
router.post("/create", protect, createPost);

// Get all posts (for feed)
router.get("/all", protect, getAllPosts);

// Get a single post by ID
router.get("/:id", protect, getPostById);

// Delete a post (Only by owner)
router.delete("/:id", protect, deletePost);

// Like a post
router.put("/like/:postId", protect, likePost);

// Unlike a post
router.put("/unlike/:postId", protect, unlikePost);

// Comment on a post
router.post("/comment/:postId", protect, commentOnPost);

// Delete a comment
router.delete("/comment/:postId/:commentId", protect, deleteComment);

// Get posts of a specific user
router.get("/user/posts", protect, getUserPosts);

module.exports = router;
