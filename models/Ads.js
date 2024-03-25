const mongoose = require("mongoose");
const AdsSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    link:{
        type: String,
    },
    image:{
        type: String,
    },
    kind:{
        type: String,
    }

});

const Ads = mongoose.model("Ads" , AdsSchema);
module.exports = Ads