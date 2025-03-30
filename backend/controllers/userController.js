const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Update User Profile (Name, Password, Bio)
exports.updateProfile = async (req, res) => {
    const { name, bio, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        // Update Name
        if (name) {
            user.name = name;
        }
        // Update Bio
        if (bio) {
            user.bio = bio;
        }
        // Update Password (if both old & new passwords are provided)
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect old password!' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Save updated user
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully!', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.updatePhoto = async () => {

}
exports.deleteAccount = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Password!' });
        }

        const deletedUser = await User.findByIdAndDelete(req.user.userId);
        res.status(201).json({ message: `Account Deleted successfully`, deletedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.followUser = async (req, res) => {
    const { id: fellowId } = req.params;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        if (user._id.toString() === fellowId) {
            return res.status(400).json({ message: `Cannot follow Yourself` });
        }

        const fellowUser = await User.findById(fellowId);
        if (!fellowUser) {
            return res.status(404).json({ message: 'Target user not found!' });
        }

        if (user.following.includes(fellowId)) {
            return res.status(400).json({ message: 'Already following this user!' });
        }
        user.following.push(fellowId); // update user following
        fellowUser.followers.push(user._id); // update user followers count

        await user.save(); //save user
        await fellowUser.save(); // save fellowUser

        res.status(200).json({ message: 'Successfully followed the user' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.unFollowUser = async (req, res) => {
    const { id: fellowId } = req.params;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const fellowUser = await User.findById(fellowId);
        if (!fellowUser) {
            return res.status(404).json({ message: 'Target user not found!' });
        }

        if (!user.following.includes(fellowId)) {
            return res.status(400).json({ message: 'You are not following this user!' });
        }
        user.following = user.following.filter(id => id.toString() !== fellowId);
        fellowUser.followers = fellowUser.followers.filter(id => id.toString() !== user._id.toString())

        await user.save(); //save user
        await fellowUser.save(); // save fellowUser

        res.status(200).json({ message: 'Successfully unfollowed the user' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}
exports.getFollowersList = async (req, res) => {
    const { id } = req.params;  // Target user ID
    const authUserId = req.user.userId;  // Authenticated user ID

    try {
        const user = await User.findById(id).populate("followers", "name regd_no email profilePic"); // Fetch target user
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Allow access if the authenticated user is the target user or follows them
        if (id === authUserId || user.followers.some(follower => follower._id.toString() === authUserId)) {
            return res.status(200).json({ followers: user.followers });
        } else {
            return res.status(403).json({ message: "Access denied! You can only view followers of users you follow." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error!" });
    }
};

exports.getFollowingList = async (req, res) => {
    const { id } = req.params;  // Target user ID
    const authUserId = req.user.userId;  // Authenticated user ID

    try {
        const user = await User.findById(id).populate("following", "name regd_no email profilePic"); // Fetch target user
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Allow access if the authenticated user is the target user or follows them
        if (id === authUserId || user.followers.some(follower => follower._id.toString() === authUserId)) {
            return res.status(200).json({ following: user.following });
        } else {
            return res.status(403).json({ message: "Access denied! You can only view following lists of users you follow." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error!" });
    }
};

exports.searchUser = async (req, res) => {
    try {
        const { q } = req.query; // Extract query parameter from URL

        if (!q) {
            return res.status(400).json({ message: "Search query is required!" });
        }

        // Perform case-insensitive search on name, email, or username
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                // { email: { $regex: q, $options: "i" } },
                { username: { $regex: q, $options: "i" } }
            ]
        })
        .select("name email regd_no profilePic") // Return only necessary fields
        .limit(10); // Limit results for efficiency

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found!" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error!" });
    }
};

exports.myNotifications = async () => {

}