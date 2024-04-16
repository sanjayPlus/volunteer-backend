const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    link: {
        type: String,
    },
    uploadedBy: {
        type: String,
    },

}, {
    timestamps: true
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;

