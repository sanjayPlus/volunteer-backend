const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
    date: {
        type: String,
    },
    time: {
        type: String,
    },
    title: {
        type: String
    },
    description: {
        type: String,
    },
    link: {
        type: String,
    },
    uploadedBy: {
        type: String,
    }
}, {
    timestamps: true
});

const Calendar = mongoose.model("Calendar", calendarSchema);
module.exports = Calendar;
