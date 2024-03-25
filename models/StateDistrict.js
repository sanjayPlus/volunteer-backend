const mongoose = require('mongoose');

const BoothSchema  =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:true
    }
})
// Assembly Schema
const AssemblySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    booths: [BoothSchema]
});

// Constituency Schema
const ConstituencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    assemblies: [AssemblySchema]
});

// District Schema
const DistrictSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    constituencies: [ConstituencySchema]
});

// Model based on District Schema
const StateDistrict = mongoose.model('StateDistrict', DistrictSchema);



module.exports = StateDistrict;