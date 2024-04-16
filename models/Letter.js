const mongoose = require("mongoose");
const LetterSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: "",
    },
    optional: {
        type: String,
        default: "",
    }
});
const Letter = mongoose.model("Letter", LetterSchema);
module.exports = Letter;