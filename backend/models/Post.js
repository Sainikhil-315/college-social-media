const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  image: { type: String, default: "" }, // Image URL
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the post
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
