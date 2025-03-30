const Post = require('../models/Post');
const User = require('../models/User');
const transporter = require('../utils/emailService');
const dotenv = require('dotenv');
dotenv.config();

exports.createPost = async (req, res) => {
    const { description, image } = req.body;
    const userId = req.user.userId;
    try {
        const newPost = await Post.create({
            user: req.user.userId, description, image
        })
        
        await User.findByIdAndUpdate(userId, {$push: {posts: newPost._id } }, { new: true })
        await newPost.save();

        // sending mail to userr for uploading post
        const user = User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your post had been uploaded successfully',
            text: `Hello ${user.name},\n\nYour post has been successfully uploaded on College Social Media. Check it out now!\n\nBest,\nCollege Social Media Team`,
        };
        transporter.sendMail(mailOptions, ( error, info ) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });

        // Notify followers about the new post
        const followers = user.followers; // Assuming followers are stored as an array in User model
        const notifications = followers.map(followerId => ({
            receiver: followerId,
            sender: req.user.userId,
            type: "new_post",
            post: newPost._id,
            message: `${user.name} has uploaded a new post.`,
        }));

        // await Notification.insertMany(notifications);  // store notification is DB

        res.status(201).json({
            message: `Post uploaded successfully`,
            newPost
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "regd_no name profilePic")
            .populate({
                path: "comments",
                select: "user text createdAt",
                populate: {path: "user", select: "name profilePic"},
                options: {sort: {createdAt: -1}},
            })
            .populate("likes", "name profilePic")
            .sort({createdAt: -1});

        res.status(200).json(posts)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "regd_no name profilePic")
            .populate({
                path: "comments",
                select: "user text createdAt",
                populate: {path: "user", select: "name profilePic"},
            })
            .populate("likes", "name profilePic")

        if(!post) {
            return res.status(404).json({ message: "Post not found!" });
        }
        res.status(200).json(post)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.deletePost = async (req, res) => {
    try {
        const deletePost = await Post.findByIdAndDelete(req.params.id);
        if (!deletePost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(400).json({
            message: `Post deleted`,
            deletePost
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.likePost = async (req, res) => {
    const { postId } = req.params;
    console.log(req.params);
    const userId = req.user.userId;
    try {
        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({message: `No post found`});
        }
        if(post.likes.includes(userId)) {
            return res.status(200).json({message: `Already liked!`});
        }
        post.likes.push(userId);
        await post.save();
        // await post.populate("likes", "regd_no name profilePic");
        res.status(200).json({message: `Successfully liked the post`, likes: post.likes, likesCount: post.likes.length})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}

exports.unlikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({message: `No post found`});
        }

        if(!post.likes.includes(userId)) {
            return res.status(200).json({message: `Not liked`});
        }

        post.likes = post.likes.filter(id => id.toString() !== userId);
        await post.save();

        res.status(200).json({message: `Successfully unliked the post`, likes: post.likes.length})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}

exports.commentOnPost = async (req, res) => {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({message: `No post found`});
        }

        post.comments.push({user: userId, text, createdAt: Date.now()});
        await post.save();
        // await post.populate("comments.user"); // Optional: To return full user details

        res.status(200).json({message: `Successfully commented on post`, comments: post.comments.reverse()})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}

exports.deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({message: `No post found`});
        }
        const userComment = post.comments.some(comment => comment._id.toString() === commentId && comment.user.toString() === userId);
        if (!userComment) {
            return res.status(403).json({ message: "You can only delete your own comments!" });
        }
        post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);

        await post.save();
        res.status(200).json({message: `comment deleted successfully`})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}

exports.getUserPosts = async (req, res) => {
    const userId = req.user.userId;
    try {
        const posts = await Post.find({user: userId});
        if (!posts.length) {
            return res.status(200).json(posts.length? posts : []);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error("error");
        res.status(500).json({ message: 'Internal server error!' });
    }
}