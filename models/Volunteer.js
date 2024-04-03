const mongoose = require("mongoose");
const Assignment = require("./Assignments");

const volunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp:{
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    booth:String,
    boothRule:Array,
    district: {
        type: String,
        
    },
    mandalam:String,
    aadhaar:Array,
    aadhaarNo:String,
    assembly:String,
    constituency:String,
    panchayath:{
        type:String,
        default:""
    },
    corpoartion:{
        type:String,
        default:""
    },
    municipality:{
        type:String,
        default:""
    },
    ward:String,
    date_of_birth:String,
    mandlamPresident:String,
    mandalamMember:String,
    verified:{
        type:Boolean,
        default:false
    },
    power:String,
    districtRule:Array,
    assemblyRule:Array,
    constituencyRule:Array,
    dccappuserId:String,
    dccappurl:String,
    assignmentsCompleted:{
        type:Array,
        default:[]
    },
    report:[{
        title:{
            type:String
        },
        description:{
            type:String
        }
    }],
    loksabha:String,
});

module.exports = mongoose.model("Volunteer", volunteerSchema);