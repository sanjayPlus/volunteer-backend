const mongoose = require('mongoose');

const InfavourSchema = new mongoose.Schema({
    infavour: {
        type: String,
        required: true,
    },
});

const Infavour = mongoose.model('Infavour', InfavourSchema);
module.exports = Infavour;