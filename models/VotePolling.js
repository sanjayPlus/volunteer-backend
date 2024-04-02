const mongoose = require("mongoose");
const VotePollingSchema = new mongoose.Schema({
    booth: {
        type: String,
        default: ""
    },
    assembly: {
        type: String,
        default: ""
    },
    loksabha: {
        type: String,
    },
    constituency: {
        type: String,
        default: ""
    },
    district: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    }
    ,
    party: {
        type: String,
    },
    image: {
        type: String,
        default: ""
    },
    optional: {
        type: String,
        default: ""
    },
    loksabha:{
        type:String,
        default:"",
    },
    symbol:{
        type:String,
        default:""
    }
});

const VotePolling = mongoose.model("VotePolling", VotePollingSchema);
module.exports = VotePolling;