const mongoose = require("mongoose");
const CasteSchema = new mongoose.Schema({
    caste: {
        type: String,
        required: true
    }
});
const Caste = mongoose.model("Caste", CasteSchema);
module.exports = Caste