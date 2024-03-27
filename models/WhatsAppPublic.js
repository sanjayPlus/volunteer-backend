const mongoose = require("mongoose");
const WhatsAppPublicSchema = new mongoose.Schema({
    link: {
        type: String,
    },
    booth: {
        type: String,
    },
    assembly: {
        type: String,
    },
    constituency: {
        type: String,
    },
    district: {
        type: String,
    },
    optional: {
        type: String,
    },
    membersNo: {
        type: Number,
    }
});
const WhatsAppPublic = mongoose.model("WhatsAppPublic", WhatsAppPublicSchema);
module.exports = WhatsAppPublic;