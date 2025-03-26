const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who receives the notification
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered the action
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null }, // Related post (for like/comment)
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
