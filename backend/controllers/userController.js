const User = require("../models/User");
const bcrypt = require("bcryptjs");

// update user profile
exports.updateName = async (req, res) => {
    const { name } = req.body;
    console.log("req.user", req.user);

    try {
        const user = await User.findById(req.user.userId);
        console.log("User Id: ", user);
        if (!user) {
            return res.json({ message: `No user found` });
        }
        user.name = name;
        await user.save();
        res.status(200).json({ message: 'Name updated successfully!', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}

exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password!' });
        }

        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}

exports.updateBio = async (req, res) => {
    const { bio } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        user.bio = bio;

        await user.save();
        res.status(200).json({ message: 'Bio updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
}