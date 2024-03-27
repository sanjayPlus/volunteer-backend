const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { sendMail } = require("./emailController");
const jwtSecret = process.env.JWT_VOLUNTEER_SECRET
const XLSX = require('xlsx');
const fs = require('fs');
const svg2img = require('svg2img');
const { promisify } = require('util');
const svgGenerator = require("../helpers/svgGenerator");
const WhatsApp = require("../models/WhatsApp");
const Assignment = require("../models/Assignments");
const VotePolling = require("../models/VotePolling");
const asyncSvg2img = promisify(svg2img);
var ml2en = require('ml2en');
const Notification = require("../models/Notification");
const { createCanvas, loadImage } = require('canvas');
const WhatsAppPublic = require("../models/WhatsAppPublic");

const register = async (req, res) => {
    try {
        const { name, email, password, booth, boothRule, district, assembly, constituency, mandalamMember, mandlamPresident, phone, taskForce } = req.body;
        const volunteerExists = await Volunteer.findOne({ email });
        if (volunteerExists) {
            return res.status(400).json({ error: "Volunteer already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const volunteer = await Volunteer.create({
            name,
            email,
            password: hashedPassword,
            booth,
            district,
            assembly,
            constituency,
            phone,
            boothRule: boothRule,
            mandalamMember,
            mandlamPresident,
            verified: false,
            taskForce
        });
        res.status(200).json({ volunteer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const volunteerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const volunteer = await Volunteer.findOne({ email });
        if (!volunteer) {
            return res.status(400).json({ message: "volunteer is not found" })
        }
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        const matchPassword = await bcrypt.compare(password, volunteer.password)
        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" })
        }
        const token = jwt.sign({ id: volunteer._id }, jwtSecret);
        res.status(200).json({ token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const volunteer = await Volunteer.findOne({ email: email });
        if (!volunteer) {
            return res.status(400).json({ message: "user is not found" })
        }
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        sendMail(
            email,
            "OTP Verification",
            `Your OTP is: ${otp}`,
            `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">VOLUNTEER APP</a>
        </div>
        <p style="font-size:1.1em">Hi ${volunteer.name},</p>
        <p>We have received a request to reset your password. Use the following OTP to reset your password. OTP is valid for 20 minutes</p>
        <p>Please do not share this OTP with anyone.</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      </div>
    </div>`
        )
            .then(async (result) => {
                console.log(result);
                volunteer.otp = otp;
                await volunteer.save();
                res.status(200).json({ message: "OTP sent successfully" });
            })
            .catch((error) => {
                console.error("Error sending OTP:", error.message);
                res.status(400).json({ message: "OTP failed" });
            });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const verifyForgotPasswordOTP = async (req, res) => {
    try {
        // Step 1: Receive User Data
        const { email, otp } = req.body;

        // Step 2: Validate User Input
        if (!email || !otp) {
            return res
                .status(400)
                .json({ error: "Please provide both email and OTP." });
        }

        // Step 3: Find User by Email
        const volunteer = await Volunteer.findOne({ email: email });

        // Step 4: Verify User and OTP
        if (!volunteer) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        if (otp !== volunteer.otp) {
            return res.status(400).json({ error: "Invalid OTP." });
        }

        // Step 5: Generate JWT
        const token = jwt.sign({ volunteerId: volunteer._id }, jwtSecret, {
            expiresIn: "36500d",
        });
        // Step 5: Send Response
        res.status(200).json({ token: token });
    } catch (error) {
        console.error("Error during OTP verification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const resetPassword = async (req, res) => {
    try {
        // Step 1: Receive User Data
        const { password } = req.body;

        // Step 2: Validate User Input
        if (!password) {
            return res.status(400).json({ error: "Please provide password." });
        }

        // Step 3: Find User by Email
        console.log(req.volunteer)
        const volunteer = await Volunteer.findById(req.volunteer.volunteerId);

        // Step 4: Verify User and Password
        if (!volunteer) {
            return res.status(400).json({ error: "Invalid credentials." });
        }

        // Step 5: Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 6: Update password
        volunteer.password = hashedPassword;
        await volunteer.save();

        // Step 7: Send Response
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error during password reset:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addUser = async (req, res) => {
    try {
        const { name,
            email,
            phone,
            address,
            booth,
            caste,
            profession,
            voterId,
            whatsappNo,
            voterStatus,
            infavour,
            houseNo,
            houseName,
            guardianName,
            gender,
            age,
            marriedStatus,
            swingVote,
            year,
            facebook,
            userVotingType,
            abroadType,
            hardFanVote,
            sNo } = req.body;

        if (!voterId) {
            return res.status(400).json({ error: "Please provide voter id" });
        }
        const voterIdExists = await User.findOne({ voterId });
        if (voterIdExists) {
            return res.status(400).json({ error: "Voter ID already exists" });
        }
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }
        let isBooth = volunteer.boothRule.includes(booth);
        if (!isBooth) {
            return res.status(400).json({ error: "Please provide a valid booth" });
        }
        if (!volunteer.district || !volunteer.assembly || !volunteer.constituency) {
            return res.status(400).json({ error: "Volunteer fields are not found" });
        }
        const filteredUserData = {};

        // Filtering out empty values
        const userDataEntries = Object.entries({
            name,
            email,
            phone,
            address,
            booth,
            caste,
            profession,
            voterId,
            whatsappNo,
            voterStatus,
            infavour,
            houseNo,
            houseName,
            guardianName,
            gender,
            age,
            district: volunteer.district,
            assembly: volunteer.assembly,
            constituency: volunteer.constituency,
            marriedStatus,
            swingVote,
            year,
            facebook,
            userVotingType,
            abroadType,
            hardFanVote,
            sNo
        });

        userDataEntries.forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                filteredUserData[key] = value;
            }
        });

        // Create the user with filtered data
        const user = await User.create(filteredUserData);

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const UpdateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, gender, age, phone, voterStatus, infavour, caste, profession, whatsappNo, houseName, houseNo, guardianName, address, email, sNo, voterId, marriedStatus, swingVote, year, facebook, verified, userVotingType,
            abroadType,
            hardFanVote, pollingParty, partyType, partyName, instagram } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        const isBooth = volunteer.boothRule.includes(user.booth);
        if (!isBooth) {
            return res.status(400).json({ error: "Please provide a valid booth" });
        }
        if (user.district !== volunteer.district) {
            return res.status(400).json({ error: "Please provide a valid district" });
        }
        if (user.constituency !== volunteer.constituency) {
            return res.status(400).json({ error: "Please provide a valid constituency" });
        }
        if (user.assembly !== volunteer.assembly) {
            return res.status(400).json({ error: "Please provide a valid assembly" });
        }

        if (phone) {
            user.phone = phone
        }
        if (name) {
            user.name = name
        }
        if (gender) {
            user.gender = gender
        }
        if (age) {
            user.age = age
        }
        if (voterStatus) {
            user.voterStatus = voterStatus
        }
        if (infavour) {
            user.infavour = infavour
        }
        if (caste) {
            user.caste = caste
        }
        if (profession) {
            user.profession = profession
        }
        if (whatsappNo) {
            user.whatsappNo = whatsappNo
        }
        if (houseName) {

            user.houseName = houseName
        }
        if (houseNo) {
            user.houseNo = houseNo
        }
        if (guardianName) {
            user.guardianName = guardianName
        }
        if (address) {
            user.address = address
        }
        if (email) {
            user.email = email
        }
        if (sNo) {
            user.sNo = sNo
        }
        if (voterId) {
            user.voterId = voterId
        }
        if (marriedStatus) {
            user.marriedStatus = marriedStatus
        }
        if (swingVote) {
            user.swingVote = swingVote
        }
        if (year) {
            user.year = year
        }
        if (facebook) {
            user.facebook = facebook
        }
        if (instagram) {
            user.instagram = instagram
        }
        if (verified) {
            user.verified = verified
        }
        if (userVotingType) {
            user.userVotingType = userVotingType
        }

        if (abroadType) {
            user.abroadType = abroadType
        }
        if (hardFanVote) {
            user.hardFanVote = hardFanVote
        }
        if (pollingParty) {
            user.pollingParty = pollingParty
        }
        if (partyType && partyName) {
            user.party.partyType = partyType;
            user.party.partyName = partyName;
        }
        await user.save();
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
const DeleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }
        const isBooth = volunteer.boothRule.includes(user.booth);

        if (!isBooth) {
            return res.status(400).json({ error: "Please provide a valid booth" });
        }
        if (user.district !== volunteer.district) {
            return res.status(400).json({ error: "Please provide a valid district" });
        }
        if (user.constituency !== volunteer.constituency) {
            return res.status(400).json({ error: "Please provide a valid constituency" });
        }
        if (user.assembly !== volunteer.assembly) {
            return res.status(400).json({ error: "Please provide a valid assembly" });
        }
        const deleteduser = await User.findByIdAndDelete(req.params.id);
        if (!deleteduser) {
            return res.status(400).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });

    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const Protected = async (req, res) => {
    try {
        res.status(200).json({ msg: "Protected route" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getUsers = async (req, res) => {
    try {
        const { booth, search, page, perPage, gender, caste, infavour, age, voterStatus, sNo, voterId, verified, marriedStatus, swingVote, year, abroadType, hardFanVote, userVotingType, houseNo, partyType, partyName } = req.query;
        const query = {};
        const volunteer = await Volunteer.findById(req.volunteer.id);

        if (!volunteer) {
            return res.status(400).json({ error: "Please provide a valid booth" });
        }
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        if (booth) {
            query['booth'] = volunteer.boothRule.includes(booth) ? booth : null;
        }
        if (!volunteer.assembly) {
            return res.status(400).json({ error: "Please provide a valid assembly" });
        }

        if (!volunteer.constituency) {
            return res.status(400).json({ error: "Please provide a valid constituency" });
        }
        if (!volunteer.district) {
            return res.status(400).json({ error: "Please provide a valid district" });
        }
        query['assembly'] = volunteer.assembly;
        query['constituency'] = volunteer.constituency;
        query['district'] = volunteer.district;

        if (search) {
            if (voterId) {

                query['voterId'] = new RegExp(search, 'i');
            } else if (houseNo) {
                query['houseNo'] = new RegExp(search, 'i');
            } else {
                query['name'] = new RegExp(search, 'i');

            }
        }
        if (gender) {
            query['gender'] = gender;
        }
        if (caste) {
            query['caste'] = caste;
        }
        if (infavour) {
            query['infavour'] = infavour;
        }
        if (age) {
            query['age'] = age;
        }
        if (voterStatus) {
            query['voterStatus'] = voterStatus;
        }
        if (verified) {
            query['verified'] = verified;
        }
        if (marriedStatus) {
            query['marriedStatus'] = marriedStatus;
        }
        if (swingVote) {
            query['swingVote'] = swingVote;
        }
        if (year) {
            query['year'] = year;
        }
        if (abroadType) {
            query['abroadType'] = abroadType;
        }
        if (hardFanVote) {
            query['hardFanVote'] = hardFanVote;
        }
        if (userVotingType) {
            query['userVotingType'] = userVotingType;
        }
        if (partyType && partyName) {
            query['party'] = {
                partyType: partyType,
                partyName: partyName
            }
        }

        const count = await User.countDocuments(query);
        let users = null;
        if (sNo === "true") {
            users = await User.find(query)
                .sort({ sNo: 1 })
                .collation({ locale: 'en', numericOrdering: true })
                .skip((page - 1) * perPage)
                .limit(perPage);
        } else {
            users = await User.find(query)
                .skip((page - 1) * perPage)
                .limit(perPage);
        }

        if (users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        res.status(200).json({
            data: users,
            currentPage: page,
            totalPages: Math.ceil(count / perPage),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
const getVolunteerDetails = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.volunteer.id).select("-password");
        res.status(200).json({ volunteer });


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const registerFromApp = async (req, res) => {
    try {
        const { name, email, password, booth, boothRule, district, assembly, constituency, mandalamMember, mandlamPresident, phone, aadhaar, aadhaarNo, dccappuserId, dccappurl, power } = req.body;
        console.log(req.body)
        const volunteerExists = await Volunteer.findOne({ email });
        if (volunteerExists) {
            return res.status(400).json({ error: "Volunteer already exists" });
        }

        const volunteer = await Volunteer.create({
            name,
            email,
            password,
            booth,
            district,
            assembly,
            constituency,
            phone,
            boothRule: boothRule,
            mandalamMember,
            mandlamPresident,
            aadhaar,
            aadhaarNo,
            dccappuserId,
            dccappurl,
            verified: false,
            power
        });

        res.status(200).json({ volunteer, volunteerId: volunteer._id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}
const getUserById = async (req, res) => {
    try {

        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        const user = await User.findById(req.params.id);
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (user.district !== volunteer.district && user.assembly !== volunteer.assembly && user.constituency !== volunteer.constituency) {
            return res.status(400).json({ error: "User not found" });
        }
        if (volunteer.boothRule.includes(user.booth) === false) {
            return res.status(400).json({ error: "User not found" });

        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const addUserFromExcel = async (req, res) => {
    try {
        const { booth, caste, infavour, voterStatus } = req.body
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (volunteer.boothRule.includes(booth) === false) {
            return res.status(400).json({ error: "Volunteer Booth not found" });

        }
        if (!volunteer.district || !volunteer.assembly || !volunteer.constituency) {
            return res.status(400).json({ error: "Volunteer fields are not found" });
        }

        const buffer = req.file.buffer;
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        // Assuming the data is in the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet data to an array of objects
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Extract the fields dynamically from the first row
        const fields = Object.keys(jsonData[0]);

        // Create an array of objects with dynamic fields and values
        const dataArray = jsonData.map((row) => {
            const dataObject = {};
            fields.forEach((field) => {
                if (field === 'gender') {
                    // Split the gender field into gender and age
                    const [gender, age] = row[field].split(' / ');
                    dataObject['gender'] = gender;
                    dataObject['age'] = parseInt(age, 10);
                } else {
                    dataObject[field] = row[field];
                }
            });
            return dataObject;
        });
        dataArray.map(async (data) => {
            const existingUser = await User.findOne({ voterId: data.voterId });
            if (!existingUser) {

                User.create({
                    sNo: data.sNo,
                    name: data.name,
                    guardianName: data.guardianName,
                    houseNo: data.houseNo,
                    houseName: data.houseName,
                    gender: data.gender,
                    age: data.age,
                    voterId: data.voterId,
                    district: volunteer.district,
                    constituency: volunteer.constituency,
                    assembly: volunteer.assembly,
                    whatsappNo: data.whatsappNo || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    infavour: infavour || data.infavour || "",
                    caste: caste || data.caste || "",
                    voterStatus: voterStatus || data.voterStatus || "",
                    booth,
                })
            }
        })

        res.status(200).json({ dataArray });
    } catch (error) {
        console.error("Error during Excel file processing:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const BulkDeleteUser = async (req, res) => {
    try {
        const { booth } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (volunteer.boothRule.includes(booth) === false) {
            return res.status(400).json({ error: "Volunteer Booth not found" });

        }
        if (!booth || !volunteer.district || !volunteer.assembly || !volunteer.constituency) {
            return res.status(400).json({ error: "Volunteer fields are not found" });
        }

        const isDeleted = await User.deleteMany({ booth, district: volunteer.district, assembly: volunteer.assembly, constituency: volunteer.constituency });
        if (!isDeleted) {
            return res.status(400).json({ error: "User not found" });
        }
        res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}
const getVolunteerLogo = async (req, res) => {
    try {
        const { booth, constituency, assembly } = req.query;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }


        const svg = svgGenerator(
            booth,
            volunteer.district,
            constituency,
            assembly
        );

        // Convert SVG to PNG
        asyncSvg2img(svg, { format: 'png' }, async (error, buffer) => {
            if (error) {
                console.error("Error converting SVG to PNG:", error.message);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            // Set content type header
            res.setHeader('Content-Type', 'image/png');
            // Set content disposition header to force browser to download
            res.setHeader('Content-Disposition', 'attachment; filename="logo.png"');
            // Send the PNG data as binary
            res.status(200).send(buffer);
        });
    } catch (error) {
        console.error("Error generating logo ID:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getVolunteerLogoV2 = async (req, res) => {
    try {
        const { booth, constituency, assembly, mandalam } = req.query;
        const canvas = createCanvas(600, 600);
        const ctx = canvas.getContext('2d');
        let symbol = '';
        if(constituency === 'Kollam'){
            symbol = 'symbol2.png';
        }else if(constituency === 'Malappuram'){
            symbol = 'symbol3.png';
        }else if(constituency === 'Ponnani'){
            symbol = 'symbol3.png';
        }else{
            symbol = 'symbol.png';
        }

        // Pre-load images
        const background = await loadImage(`${process.env.DOMAIN}/idcard/logo.jpg`);
        const sasiImage = await loadImage(`${process.env.DOMAIN}/idcard/${constituency}.png`);
        const symbolImage = await loadImage(`${process.env.DOMAIN}/idcard/${symbol}`);

        // Draw background
        ctx.drawImage(background, 0, 0, 600, 600);

        // Draw second image
        ctx.drawImage(sasiImage, 110, 138, 220, 220);

        // Draw third image
        ctx.drawImage(symbolImage, 180, 10, 350, 350);

        // Add text fields with styles
        ctx.font = '900 30px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(constituency, 130, 400);

        ctx.font = '600 30px Arial';
        ctx.fillText(assembly, 130, 440);
        if(mandalam.length>14){

            ctx.font = '600 20px Arial';
        }else{

            ctx.font = '600 30px Arial';
        }

        ctx.fillStyle = '#A90290';
        ctx.fillText(mandalam, 280, 300);

        ctx.font = '900 50px Arial';
        ctx.fillStyle = '#250295';
        ctx.fillText(booth, 320, 350);

        // Convert the canvas to a Buffer and send it in the response
        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error("Error generating logo ID:", error);
        if (error.code === 'ENOTFOUND') {
            res.status(500).json({ error: "The domain name could not be resolved. Please check your DNS settings and environment variables." });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};


const loginFromApp = async (req, res) => {
    try {
        const { volunteerId } = req.body;
        const user = await Volunteer.findById(volunteerId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "365d" });
        res.status(200).json({ token, user });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

const addAssignmentCompleted = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        volunteer.assignmentsCompleted.push(assignmentId);
        await volunteer.save();
        res.status(200).json({ msg: "Assignment completed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getAssignmentsCompleted = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.volunteer.id);
        res.status(200).json(volunteer.assignmentsCompleted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const deleteAssignmentCompleted = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        const index = volunteer.assignmentsCompleted.indexOf(assignmentId);
        if (index > -1) {
            volunteer?.assignmentsCompleted?.splice(index, 1);
        }
        await volunteer.save();
        res.status(200).json({ msg: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const addReport = async (req, res) => {
    try {
        const { title, description } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        volunteer.report.push({
            title,
            description
        })
        await volunteer.save();
        res.status(200).json({ msg: "Report added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getWhatsApp = async (req, res) => {
    try {
        const whatsapp = await WhatsApp.find();
        res.status(200).json({ whatsapp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find();
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getPollingparty = async (req, res) => {
    try {
        const { booth } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (volunteer.boothRule.includes(booth) === false) {
            return res.status(400).json({ error: "Volunteer Booth not found" });

        }
        const polling = await VotePolling.find({ district: volunteer.district, constituency: volunteer.constituency, assembly: volunteer.assembly, booth: booth })
        res.status(200).json({ polling });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getStaticsOfPolling = async (req, res) => {
    try {
        const { booth } = req.query;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }
        if (!volunteer.boothRule.includes(booth)) {
            return res.status(400).json({ error: "Volunteer Booth not found" });
        }
        const users = await User.find({ district: volunteer.district, constituency: volunteer.constituency, assembly: volunteer.assembly, booth: booth });
        const pollingPartyList = users.filter(user => user.pollingParty);
        const uniquePollingParty = [...new Set(pollingPartyList.map(user => user.pollingParty))];
        const statistics = uniquePollingParty.map(pollingParty => {
            const partyUsers = pollingPartyList.filter(user => user.pollingParty === pollingParty);
            const partyCount = partyUsers.length;
            const totalUsers = pollingPartyList.length;
            const percentage = (partyCount / totalUsers) * 100;
            return {
                name: pollingParty,
                count: partyCount,
                percentage: percentage.toFixed(2),
                users: partyUsers
            };
        });
        res.status(200).json(statistics);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" });
    }
}

const getWhatsAppByPower = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }

        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        const whatsapps = await WhatsApp.find();
        const whatsappList = [];
        whatsapps.forEach(whatsapp => {
            if (volunteer.power === "DTF") {

                whatsappList.push(whatsapp)
            } else if (volunteer.power === "ATF") {
                if (whatsapp.power === "ATF" || whatsapp.power === "MTF" || whatsapp.power === "BTF") {
                    whatsappList.push(whatsapp)
                }
            } else if (volunteer.power === "MTF") {
                if (whatsapp.power === "MTF" || whatsapp.power === "BTF") {
                    whatsappList.push(whatsapp)
                }
            } else if (volunteer.power === "BTF") {
                if (whatsapp.power === "BTF") {
                    whatsappList.push(whatsapp)
                }
            }
        })
        if (whatsappList.length === 0) {
            return res.status(404).json({ error: "No whatsapp found" });
        }
        res.status(200).json({ whatsapp: whatsappList });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const addDataFromJson = async (req, res) => {
    try {
        const { booth, caste, infavour, voterStatus } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if (volunteer.boothRule.includes(booth) === false) {
            return res.status(400).json({ error: "Volunteer Booth not found" });

        }
        const jsonData = JSON.parse(req.file.buffer.toString());

        function renameKeys(obj, newKeys) {
            const keyValues = Object.keys(obj).map(key => {
                let newKey = key;
                let value = obj[key];

                if (key.includes(" : ")) {
                    // Split key into separate key and value
                    const [newKeyName, newValue] = key.split(" : ");
                    newKey = newKeyName.trim(); // Remove any leading/trailing spaces
                    value = newValue.trim(); // Remove any leading/trailing spaces
                } else if (key.startsWith("പ്രായം")) {
                    const value = key.split(" : ")[1];
                    newKey = "age";
                }

                // Check for additional characters like semicolons, commas, single quotes, and spaces
                if (newKey.includes(" ; ")) {
                    newKey = newKey.split(" ; ")[1].trim(); // Extract the desired key
                } else if (newKey.includes(" , ")) {
                    newKey = newKey.split(" , ")[1].trim(); // Extract the desired key
                } else if (newKey.includes(" ' ")) {
                    newKey = newKey.split(" ' ")[1].trim(); // Extract the desired key
                }
                newKey = newKeys[newKey] || newKey;
                // Transform gender field values
                if (newKey === "gender") {
                    if (value.includes("സ്ത്രീ")) {
                        value = "F";
                    } else if (value.includes("പുരുഷന്‍")) {
                        value = "M";
                    } else {
                        value = "N";
                    }
                }


                return { [newKey]: value };
            });
            return Object.assign({}, ...keyValues);
        }

        // Define new key names
        const newKeyNames = {
            "പേര്‌": "name",
            "പൌര": "name",
            "പേര": "name",
            "പേ": "name",
            "അമ്മയുടെ പേര്‍": "guardianName",
            "അച്ഛന്റെ പേര്‌": "guardianName",
            "അച്ചന്റെ പേര്‌": "guardianName",
            "വിട്ടു നമ്പര്‍": "houseName",
            "വീട്ടു നമ്പര്‍": "houseName",
            "വീട്ടു പ": "houseName",
            "ഭര്‍ത്താവിന്റെ പേര്": "guardianName",
            "ഭര്‍ത്താവിന്റെ പേര്‌": "guardianName",
            "അമ്മയുടെ പേര്‌": "guardianName",
            "അച്ഛന്റെ പേര": "guardianName",
            "അമ്മന്മുടെ പേര്‌": "guardianName",
            "പ്രായം": "age",
            "ലിംഗം": "gender",
            'SL Number': "sNo",
            "VoterID": "voterId",

        };

        const modifiedData = jsonData.map(obj => renameKeys(obj, newKeyNames));
        modifiedData.map(async (data) => {
            let newName = "";
            let newGuardianName = "";
            let newHouseName = "";
            try {

                newName = ml2en(data.name);
                newGuardianName = ml2en(data.guardianName);
                newHouseName = ml2en(data.houseName);
            } catch (e) {
                console.log("Error", e);
            }
            const existingUser = await User.findOne({ voterId: data.voterId });
            if (!existingUser) {
                User.create({
                    sNo: data.sNo,
                    name: newName,
                    guardianName: newGuardianName,
                    houseNo: data.houseNo,
                    houseName: newHouseName,
                    gender: data.gender,
                    age: data.age,
                    voterId: data.voterId,
                    district: volunteer.district,
                    constituency: volunteer.constituency,
                    assembly: volunteer.assembly,
                    booth,
                    whatsappNo: data.whatsappNo || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    infavour: infavour || data.infavour || "",
                    caste: caste || data.caste || "",
                    voterStatus: voterStatus || data.voterStatus || "",
                });
            }
        });

        res.status(200).json(modifiedData);
    } catch (error) {
        console.error('Error handling file upload:', error.message);
        res.status(500).json({ error: 'Failed to handle file upload' });
    }
};

const storeNotificationToken = async (req, res) => {
    try {
        const { FCMToken } = req.body;
        const notification = await Notification.findOne({ token: FCMToken });
        if (!notification) {
            const notification = await Notification.create({ token: FCMToken, userId: req.volunteer.id });
            res.status(200).json({ notification });
        } else {
            res.status(200).json({ notification });
        }
    } catch (error) {
        console.error("Error during token store:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addWhatsAppPublic = async (req, res) => {
    try {
        const { link, booth, assembly, constituency, optional, membersNo } = req.body;
        const volunteer = await Volunteer.findById(req.volunteer.id);
        if (!volunteer.verified) {
            return res.status(400).json({ error: "Volunteer not verified" });
        }
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        if(!volunteer.district){
            return res.status(400).json({ error: "Volunteer District not found" });
        }
        const whatsAppPublic = await WhatsAppPublic.create({
            link,
            optional,
            booth,
            assembly,
            constituency,
            district: volunteer.district,
            membersNo: Number(membersNo)||0
        })
        await whatsAppPublic.save();
        res.status(200).json({ message: "Whatsapp public added successfully", whatsAppPublic });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}


module.exports = {
    register,
    addUser,
    volunteerLogin,
    Protected,
    UpdateUser,
    DeleteUser,
    forgetPassword,
    verifyForgotPasswordOTP,
    resetPassword,
    getUsers,
    getVolunteerDetails,
    registerFromApp,
    getUserById,
    addUserFromExcel,
    BulkDeleteUser,
    getVolunteerLogo,
    loginFromApp,
    addAssignmentCompleted,
    getAssignmentsCompleted,
    deleteAssignmentCompleted,
    addReport,
    getWhatsApp,
    getAssignments,
    getStaticsOfPolling,
    getWhatsAppByPower,
    getPollingparty,
    addDataFromJson,
    storeNotificationToken,
    getVolunteerLogoV2,
    addWhatsAppPublic,
}