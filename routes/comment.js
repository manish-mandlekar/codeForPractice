const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
    },
    comment: String,
    date: {
        type: Date,
        default: Date.now,
    }
});

const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;