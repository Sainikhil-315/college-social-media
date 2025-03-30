const mongoose = require("mongoose");

// const NotificationSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who receives the notification
//   type: { type: String, enum: ["like", "comment", "follow"], required: true },
//   fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered the action
//   post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null }, // Related post (for like/comment)
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

const NotificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'post'],
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: function () {
      return this.type !== 'post'
    },
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
},
  { timeStamp: true }
)

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
