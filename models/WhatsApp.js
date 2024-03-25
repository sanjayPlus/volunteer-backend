const mongoose = require("mongoose");
const WhatsAppSchema = new mongoose.Schema({
    link: {
        type: String,
    },
    optional: {
        type: String,
    },
    power: {
        type: String,
    }
});
const WhatsApp = mongoose.model("WhatsApp", WhatsAppSchema);
module.exports = WhatsApp;