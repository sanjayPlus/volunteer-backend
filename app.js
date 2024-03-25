require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const PORT = process.env.PORT || 5000;
const adminRoutes = require("./routes/adminRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const userRoutes = require("./routes/userRoutes");
//connecting to mongodb
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("connected to mongodb");
}).catch((err) => {
    console.log(err);
})


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
//morgan for logging
app.use(morgan("dev"));

//importing routes
app.use('/api/admin',adminRoutes);
app.use('/api/volunteer',volunteerRoutes);
app.use('/api/user',userRoutes);
app.get('/', (req, res) => {
    res.send("server is running")
})
app.listen(PORT, (err) => {
    if (err) {
       return console.log(err);
    }
    console.log(`server is running on port ${PORT}`);
})
