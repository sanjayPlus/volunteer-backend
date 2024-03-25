const mongoose = require("mongoose");
const HistorySchema = new mongoose.Schema({
    title:{
        type: String
    },
    description:{
        type: String
    },
    link:{
        type: String
    },
    optional:{
        type: String
    },
    year:{
        type: String
    }
});

const History = mongoose.model("History", HistorySchema);
module.exports = History;