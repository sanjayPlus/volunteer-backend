const mongoose = require("mongoose");
const CarouselSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    link:{
        type: String,
    },
    image:{
        type: String,
    },
    type:{
        type: String,
    }

});

const Carousel = mongoose.model("Carousel" , CarouselSchema);
module.exports = Carousel