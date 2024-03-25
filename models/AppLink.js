const mongoose = require("mongoose");

const AppLinkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("AppLink", AppLinkSchema);
