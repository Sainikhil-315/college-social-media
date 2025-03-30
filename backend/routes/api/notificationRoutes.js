const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const {
    getNotifications,
    markAsRead,
    readAll,
    deleteNotification,
    clearAllNotifications
} = require("../../controllers/notificationController");

// Get notifications for a user
router.get("/", protect, getNotifications);

// Mark a notification as read
router.put("/:notificationId/read", protect, markAsRead);

// Mark a notification as read all
router.put("/:notificationId/read-all", protect, readAll);

// Delete a single notification
router.delete("/:notificationId", protect, deleteNotification);

// Clear all notifications for a user
router.delete("/clear", protect, clearAllNotifications);

module.exports = router;
