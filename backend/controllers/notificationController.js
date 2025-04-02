const Notification = require("../models/Notification")

exports.getNotifications = async (req, res) => {
    const userId = req.user.userId;
    try {
        const notifications = await Notification.find({ receiver: userId })
            .populate('sender', 'name profilePic regd_no')
            .populate('post', 'description image')
            .sort({ createdAt: -1 })

        res.status(200).json({ notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error!" });
    }
}

exports.markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;
    try {
        const notification = await Notification.findByIdAndUpdate(
            { _id: notificationId, sender: userId },
            { isRead: true },
            { new: true }
        )
        if (!notification) {
            return res.status(404).json({ message: "Notification not found!" });
        }

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
}

exports.readAll = async (req, res) => {
    const userId = req.user.userId;
    try {
        const updateNotifications = await Notification.updateMany(
            { sender: userId },
            { new: true }
        )

        if (updateNotifications.nModified === 0) {
            return res.status(200).json({ message: "No unread notifications" });
        }

        res.status(200).json({ message: "All unread notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notification as read:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
}

exports.deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;
    try {
        const deleteNotification = await Notification.findByOneAndDelete(
            { _id: notificationId },
            { receiver: userId }
        );

        if (!deleteNotification) {
            return res.status(404).json({ message: "Notification not found!" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNotification:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
}

exports.clearAllNotifications = async (req, res) => {
    const userId = req.user.userId;
    try {
        const notification = await Notification.deleteMany(
            { receiver: userId }
        )

        if (notification.deletedCount === 0) {
            return res.status(200).json({ message: "No notifications to delete" });
        }

        res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
        console.error("Error in clearing Notifications:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
}