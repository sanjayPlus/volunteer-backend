const mongoose = require("mongoose");
const HistorySchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    link: {
        type: String
    },
    optional: {
        type: String
    },
    party: [{
        name: {
            type: String,
            default: ""
        },
        percentage: {
            type: String,
            default: ""
        },
        count: {
            type: String,
            default: ""
        }
    }],
    no_of_voters: {
        type: String,
        default: ""
    },
    no_of_votes: {
        type: String,
        default: ""
    },
    election_type: {
        type: String,
        default: ""
    },
    year: {
        type: String
    },
    district: {
        type: String
    },
    loksabha: {
        type: String
    },
    assembly: {
        type: String
    },
    panchayath: {
        type: String
    }
    ,
    booth: {
        type: String
    }
    , constituency: {
        type: String
    }
});

const History = mongoose.model("History", HistorySchema);
module.exports = History;