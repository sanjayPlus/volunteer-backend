const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getAllusers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default to page 1
        const limit = parseInt(req.query.limit) || 10; // default limit to 10 documents per page
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .skip(skip)
            .limit(limit);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUserWithId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = {
    getAllusers,
    getUserWithId
}