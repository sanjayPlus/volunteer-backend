const mongoose = require("mongoose");
const AssignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: "",
    },
    districtRule: {
        type: String,
        default: "",
    },
    taskForce: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    link: {
        type: String,
        default: "",
    }
    ,
    optional: {
        type: String,
        default: "",
    },
    date: {
        type: String,
        default: "",
    }
});
const Assignment = mongoose.model("Assignment", AssignmentSchema);
module.exports = Assignment;