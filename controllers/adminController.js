const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const jwtSecret = process.env.JWT_ADMIN_SECRET;
const bcrypt = require("bcrypt");
const Volunteer = require("../models/Volunteer");
const XLSX = require('xlsx');
const fs = require('fs');
const User = require("../models/User");
const StateDistrict = require("../models/StateDistrict");
const District = require("../models/District");
const Mandalam = require("../models/Mandalam");
const axios = require("axios");
const Infavour = require("../models/Infavour");
const Caste = require("../models/Caste");
const Swing = require("../models/Swing");
const Carousel = require("../models/Carousel");
const DailyNews = require("../models/DailyNews");
const Assignment = require("../models/Assignments");
const WhatsApp = require("../models/WhatsApp");
const AppLink = require("../models/AppLink");
const History = require("../models/History");
const Ads = require("../models/Ads");
const VotePolling = require("../models/VotePolling");
const WhatsAppPublic = require("../models/WhatsAppPublic");
const readJSONFile = require("../helpers/readJSONFile");
var ml2en = require('ml2en');
const NotificationList = require("../models/NotificationList");
const serviceAccount = require("../firebase/firebase");
const admin = require("firebase-admin");
const Notification = require("../models/Notification");
const { type } = require("os");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Replace with your Firebase project config
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const token = jwt.sign({ id: admin._id }, jwtSecret);
        res.status(200).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
    } catch (error) {
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
const CreateVolunteer = async (req, res) => {
    try {
        const { name, email, password, gender, booth, boothRule, district, assembly, constituency, mandalamMember, mandlamPresident, phone, loksabha } = req.body;
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
            gender,
            assembly,
            constituency,
            phone,
            boothRule: boothRule,
            mandalamMember,
            mandlamPresident,
            verified: true,
            loksabha
        });
        res.status(200).json({ volunteer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const UpdateVolunteer = async (req, res) => {
    try {
        const { name, email, phone, gender, address, booth, boothRule, district, assembly, mandalamMember, mandlamPresident, volunteerId, loksabha, password,constituency } = req.body;
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }

        if (name) {
            volunteer.name = name;
        }
        if (email) {
            volunteer.email = email;
        }
        if (phone) {
            volunteer.phone = phone;
        }
        if (address) {
            volunteer.address = address;
        }
        if (booth) {
            volunteer.booth = booth;
        }
        if (boothRule.length > 0) {
            volunteer.boothRule = boothRule;

        }
        if (district) {
            volunteer.district = district;
        }
        if (constituency) {
            volunteer.constituency = constituency;
        }
        if (assembly) {
            volunteer.assembly = assembly;
        }
        if (mandalamMember) {
            volunteer.mandalamMember = mandalamMember;
        }
        if (mandlamPresident) {
            volunteer.mandlamPresident = mandlamPresident;
        }
        if (gender) {
            volunteer.gender = gender;
        }
        if (loksabha) {
            volunteer.loksabha = loksabha;
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            volunteer.password = hashedPassword;
        }
        await volunteer.save();
        res.status(200).json({ volunteer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const VerifyVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, { verified: true });
        const token = jwt.sign({ id: volunteer._id }, process.env.VOLUNTEER_SERVER_SECRET, { expiresIn: "1d" });
        axios.post(`${volunteer.dccappurl}/api/user/verify-volunteer`, {
            id: volunteer.
                dccappuserId, url: volunteer.dccappurl, verified: true
        }, {
            headers: {
                "x-access-token": token
            }
        }).then(() => {
            console.log("Volunteer verified successfully");
        })
        res.status(200).json({ message: "Volunteer verified successfully", volunteer });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const VerifyVolunteerFromApp = async (req, res) => {
    try {
        const { id, url, verify } = req.body
        const volunteer = await Volunteer.findByIdAndUpdate(id, { verified: verify });
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "server-token-key": process.env.SERVER_TOKEN_KEY
            },
            body: JSON.stringify({
                id: id,
                verified: verify
            })
        })
        res.status(200).json(volunteer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const DeleteVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) {
            return res.status(400).json({ error: "Volunteer not found" });
        }
        const token = jwt.sign({ id: volunteer._id }, process.env.VOLUNTEER_SERVER_SECRET, { expiresIn: "1d" });
        axios.post(`${volunteer.dccappurl}/api/user/delete-volunteer`, { id: volunteer.dccappuserId, url: volunteer.dccappurl, verified: false }, {
            headers: {
                "x-access-token": token
            }
        }).then(() => {
            console.log("Volunteer deleted successfully");
        }).catch(() => {
            console.log("Error deleting volunteer");
        });

        res.status(200).json({ volunteer });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getVolunteers = async (req, res) => {
    try {
        const { ward, booth, assembly, constituency, district, search, page, perPage,power } = req.query
        const query = {};
        if (ward) {
            query['ward'] = ward
        }
        if (booth) {
            query['booth'] = booth
        }
        if (assembly) {
            query['assembly'] = assembly
        }
        if (constituency) {
            query['constituency'] = constituency
        }
        if (district) {
            query['district'] = district
        }
        if (search) {
            query['name'] = new RegExp(search, 'i')
        }
        if(power){
            query['power'] = power
        }
        query['verified'] = true
        const count = await Volunteer.countDocuments(query)
        const volunteers = await Volunteer.find(query).skip((page - 1) * perPage).limit(perPage)
        res.status(200).json({
            data: volunteers,
            currentPage: page,
            totalPages: Math.ceil(count / perPage),
        })
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getVolunteersNotVerified = async (req, res) => {
    try {
        const { ward, booth, assembly, constituency, district, power,search, page, perPage } = req.query
        const query = {};
        if (ward) {
            query['ward'] = ward
        }
        if (booth) {
            query['booth'] = booth
        }
        if (assembly) {
            query['assembly'] = assembly
        }
        if (constituency) {
            query['constituency'] = constituency
        }
        if (district) {
            query['district'] = district
        }
        if (search) {
            query['name'] = new RegExp(search, 'i')
        }
            if(power){
                query['power'] = power;
            }

        query['verified'] = false
        const count = await Volunteer.countDocuments(query)
        const volunteers = await Volunteer.find(query).skip((page - 1) * perPage).limit(perPage)
        res.status(200).json({
            data: volunteers,
            currentPage: page,
            totalPages: Math.ceil(count / perPage),
        })
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        res.status(200).json(volunteer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);

    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getUsers = async (req, res) => {
    try {
        const { ward, booth, assembly, constituency, district, search, page, perPage, gender, caste, infavour, age, voterStatus, sNo, voterId, verified, marriedStatus, swingVote, year, partyType, partyName } = req.query
        const query = {};
        if (ward) {
            query['ward'] = ward
        }
        if (booth) {
            query['booth'] = booth
        }
        if (assembly) {
            query['assembly'] = assembly
        }
        if (constituency) {
            query['constituency'] = constituency
        }
        if (district) {
            query['district'] = district
        }
        if (search) {
            if (voterId) {

                query['voterId'] = new RegExp(search, 'i');
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

        res.status(200).json({
            data: users,
            currentPage: page,
            totalPages: Math.ceil(count / perPage),
        })
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const addUser = async (req, res) => {
    try {
        const { district, constituency, assembly, booth, caste, infavour, voterStatus, name, gender, age, voterId,
            whatsappNo,
            guardianName,
            houseNo, houseName, address, email,
            phone,
            sNo,
            marriedStatus, swingVote, year
        } = req.body
        const isUserExists = await User.findOne({ voterId })
        if (isUserExists) {
            return res.status(400).json({ error: "User already exists" })
        }
        const user = await User.create({
            district, constituency, assembly, booth, caste, infavour,
            voterStatus, name, gender, age, voterId,
            whatsappNo, voterStatus, guardianName, address, email,
            houseNo, houseName,
            phone, sNo, verified: false, marriedStatus, swingVote, year
        });
        res.status(200).json({ user })
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { district, constituency, assembly, booth, caste, infavour, voterStatus, name, gender, age, voterId,
            whatsappNo,
            guardianName,
            houseNo, houseName, address, email, phone, sNo, verified, marriedStatus, swingVote, year, facebook, pollingParty, partyType, partyName, instagram } = req.body
        if (district) {
            user.district = district
        }
        if (constituency) {
            user.constituency = constituency
        }
        if (assembly) {
            user.assembly = assembly
        }
        if (booth) {
            user.booth = booth
        }
        if (caste) {
            user.caste = caste
        }
        if (infavour) {
            user.infavour = infavour
        }
        if (voterStatus) {
            user.voterStatus = voterStatus
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
        if (voterId) {
            user.voterId = voterId
        }
        if (whatsappNo) {
            user.whatsappNo = whatsappNo
        }
        if (guardianName) {
            user.guardianName = guardianName
        }
        if (houseNo) {
            user.houseNo = houseNo
        }
        if (houseName) {
            user.houseName = houseName
        }
        if (address) {
            user.address = address
        }
        if (email) {
            user.email = email
        }
        if (phone) {
            user.phone = phone
        }
        if (sNo) {
            user.sNo = sNo
        }
        if (verified) {
            user.verified = verified
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
        if (pollingParty) {
            user.pollingParty = pollingParty;
        }
        if (partyType && partyName) {
            user.party.partyType = partyType
            user.party.partyName = partyName
        }
        await user.save();
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const deleteBulkUsers = async (req, res) => {
    try {
        const { district, constituency, assembly, booth } = req.body;

        // Check if required fields are provided
        if (!district || !constituency || !assembly || !booth) {
            return res.status(400).json({ error: "Missing required fields in request body" });
        }

        const deleteResult = await User.deleteMany({
            district,
            constituency,
            assembly,
            booth
        });

        // Check if any users were deleted
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "No users found matching the provided criteria" });
        }

        res.status(200).json({ deletedCount: deleteResult.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const addUserFromExcel = async (req, res) => {
    try {
        const { district, constituency, assembly, booth, caste, infavour, voterStatus } = req.body
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
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
                    district,
                    constituency,
                    assembly,
                    booth,
                    whatsappNo: data.whatsappNo || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    infavour: infavour || data.infavour || "",
                    caste: caste || data.caste || "",
                    voterStatus: voterStatus || data.voterStatus || "",
                })
            }
        })

        res.status(200).json({ dataArray });
    } catch (error) {
        console.error("Error during Excel file processing:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getUsersByDistrict = async (req, res) => {
    try {
        const users = await User.find({ district: req.params.district });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const AddStateDistrict = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res
                .status(400)
                .json({ error: "Please provide all required fields." });
        }
        const newDistrict = await StateDistrict.create({
            name,
        });
        res.status(201).json(newDistrict);
    } catch (error) {
        console.error("Error adding district:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const AddStateConstituency = async (req, res) => {
    try {
        const { name, district } = req.body;

        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: "Please provide a name for the constituency." });
        }

        // Find the district with the provided name
        const existingDistrict = await StateDistrict.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "StateDistrict not found" });
        }

        // Create a new Constituency instance
        const newConstituency = {
            name: name,
            assemblies: [] // You can initialize with empty assemblies if required
        };

        // Push the new constituency to the district's constituencies array
        existingDistrict.constituencies.push(newConstituency);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Constituency added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding constituency:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const AddStateAssembly = async (req, res) => {
    try {
        const { name, district, constituency } = req.body;

        // Check if name, district, and constituency are provided
        if (!name || !district || !constituency) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await StateDistrict.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "StateDistrict not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Create a new Assembly instance
        const newAssembly = {
            name: name,
            booths: []  // You can initialize with empty booths if required
        };

        // Push the new assembly to the constituency's assemblies array
        existingConstituency.assemblies.push(newAssembly);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Assembly added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding assembly:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const AddStateBooth = async (req, res) => {
    try {
        const { name, number, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await StateDistrict.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "StateDistrict not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Booth instance
        const newBooth = {
            name: name,
            number: number
        };

        // Push the new booth to the assembly's booths array
        existingAssembly.booths.push(newBooth);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Booth added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding booth:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getStateDistrictV1 = async (req, res) => {
    try {
        const { district, constituency, assembly } = req.query;
        if (!district && !constituency && !assembly) {
            const allDistricts = await StateDistrict.find({}, 'name'); // Fetch only the 'name' field
            return res.status(200).json(allDistricts.map(d => d.name));
        }
        // If only district is provided, return all constituencies
        if (district && !constituency && !assembly) {
            const result = await StateDistrict.findOne({ name: district });
            if (result) {
                return res.status(200).json(result.constituencies.map(con => con.name));
            } else {
                return res.status(404).json({ error: "StateDistrict not found" });
            }
        }

        // If district and constituency are provided, return all assemblies
        if (district && constituency && !assembly) {
            const result = await StateDistrict.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    return res.status(200).json(selectedConstituency.assemblies.map(asm => asm.name));
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "StateDistrict not found" });
            }
        }

        // If district, constituency, and assembly are provided, return all booths
        if (district && constituency && assembly) {
            const result = await StateDistrict.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    const selectedAssembly = selectedConstituency.assemblies.find(asm => asm.name === assembly);
                    if (selectedAssembly) {
                        return res.status(200).json(selectedAssembly.booths.map(pan => {
                            return {
                                name: pan.name,
                                number: pan.number
                            }
                        }));
                    } else {
                        return res.status(404).json({ error: "Assembly not found within the constituency" });
                    }
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "StateDistrict not found" });
            }
        }

        return res.status(400).json({ error: "Invalid parameters provided" });

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const DeleteStateDistrict = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: "Please provide a name for the district." });
        }

        // Find and delete the district
        const deletedDistrict = await StateDistrict.findOneAndDelete({ name });

        // If district not found
        if (!deletedDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        res.status(200).json({ message: "District deleted successfully", deletedDistrict });
    } catch (error) {
        console.error("Error deleting district:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const DeleteStateConstituency = async (req, res) => {
    try {
        const { district, constituency } = req.body;

        // Check if district and constituency are provided
        if (!district || !constituency) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await StateDistrict.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the index of the constituency within the found district
        const constituencyIndex = existingDistrict.constituencies.findIndex(c => c.name === constituency);

        // If constituency not found
        if (constituencyIndex === -1) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Remove the constituency from the district's constituencies array
        existingDistrict.constituencies.splice(constituencyIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Constituency deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting constituency:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const DeleteStateAssembly = async (req, res) => {
    try {
        const { district, constituency, assembly } = req.body;

        // Check if district, constituency, and assembly are provided
        if (!district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await StateDistrict.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the index of the assembly within the found constituency
        const assemblyIndex = existingConstituency.assemblies.findIndex(a => a.name === assembly);

        // If assembly not found
        if (assemblyIndex === -1) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Remove the assembly from the constituency's assemblies array
        existingConstituency.assemblies.splice(assemblyIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Assembly deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting assembly:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const DeleteStateBooth = async (req, res) => {
    try {
        const { district, constituency, assembly, booths } = req.body;

        // Check if district, constituency, assembly, and booths are provided
        if (!district || !constituency || !assembly || !booths) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await StateDistrict.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the booths within the found assembly
        const panchayathIndex = existingAssembly.booths.findIndex(p => p.number === booths);

        // If booths not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Booths not found within the assembly" });
        }

        // Remove the booths from the assembly's booths array
        existingAssembly.booths.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Booths deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting booths:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//real district api

const getInfavour = async (req, res) => {
    try {
        const infavour = await Infavour.find();
        res.status(200).json({ infavour });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
const addInfavour = async (req, res) => {
    try {
        const { infavour } = req.body;
        const newInfavour = new Infavour({ infavour });
        await newInfavour.save();
        res.status(200).json({ message: "Infavour added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
const deleteInfavour = async (req, res) => {
    try {
        const deletedInfavour = await Infavour.findOneAndDelete({ _id: req.params.id });
        res.status(200).json({ message: "Infavour deleted successfully", deletedInfavour });
    } catch (error) {

        res.status(500).json({ error: "Internal server error" });

    }
}
//caste api
const addCaste = async (req, res) => {
    try {
        const { caste } = req.body;
        const newCaste = new Caste({ caste });
        await newCaste.save();
        res.status(200).json({ message: "Caste added successfully" });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
}
const getCaste = async (req, res) => {
    try {
        const castes = await Caste.find();
        res.status(200).json({ castes });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteCaste = async (req, res) => {
    try {
        const deletedCaste = await Caste.findOneAndDelete({ _id: req.params.id });
        res.status(200).json({ message: "Caste deleted successfully", deletedCaste });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
const addSwing = async (req, res) => {
    try {
        const { swing } = req.body;
        const newSwing = new Swing({ swing });
        await newSwing.save();
    } catch (error) {

    }
}
const getSwing = async (req, res) => {
    try {
        const swings = await Swing.find();
        res.status(200).json({ swings });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });

    }
}
const deleteSwing = async (req, res) => {
    try {
        const deletedSwing = await Swing.findOneAndDelete({ _id: req.params.id });
        res.status(200).json({ message: "Swing deleted successfully", deletedSwing });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}


const addCarousel = async (req, res) => {
    try {
        const { name, link, type } = req.body;
        const imageObj = req.file
        const carousel = await Carousel.create({
            name,
            link,
            type,
            image: `${process.env.DOMAIN}/CarouselImage/${imageObj.filename}`
        })
        await carousel.save();
        res.status(200).json({ message: "Carousel Image added sucessfuliy", carousel });
    } catch (error) {
        console.error("Error deleting image:", error.message);
        res.status(500).json({ error: "Internal Server Error" })
    }
}

const getCarousel = async (req, res) => {
    try {
        const carousel = await Carousel.find({});
        res.status(200).json({ carousel });
    } catch (error) {
        console.error("Something went wrong", error.message);
        res.status(500).json({ error: "internal server error" });
    }

}

const deleteCarousel = async (req, res) => {
    try {
        const { id } = req.params;
        const carousel = await Carousel.findById(id);
        if (!carousel) {
            return res.status(404).json({ message: "Carousel Image not found" });
        }
        await Carousel.deleteOne({ _id: id });
        res.status(200).json({ message: "Carousel Image deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addDailyNews = async (req, res) => {
    try {
        const { title, news, link, optional, date } = req.body;
        const imageObj = req.file;
        const dailyNews = await DailyNews.create({
            title,
            link,
            news,
            optional,
            image: `${process.env.DOMAIN}/DailyNewsImage/${imageObj.filename}`,
            date,
        })
        await dailyNews.save();
        res.status(200).json({ message: "Daily News added sucessfully", dailyNews });
    } catch (error) {
        console.error("error adding daily news", error.message);
        res.status(500).json({ error: "internal server error" })
    }
}

const getDailyNews = async (req, res) => {
    try {
        const { date } = req.query;
        const query = date ? { date } : {};

        const dailyNews = await DailyNews.find(query);
        res.status(200).json({ dailyNews });
    } catch (error) {
        console.error("error getting daily news", error.message);
        res.status(500).json({ error: "internal server error" })
    }
}

const deleteDailyNews = async (req, res) => {
    try {
        const { id } = req.params;
        await DailyNews.deleteOne({ _id: id })
        res.status(200).json({ message: "daily news deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const addWhatsApp = async (req, res) => {
    try {
        const { link, optional, power } = req.body;
        const whatsapp = await WhatsApp.create({
            link,
            optional,
            power
        })
        await whatsapp.save();
        res.status(200).json({ message: "Whatsapp added successfully", whatsapp });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const getWhatsApp = async (req, res) => {
    try {
        const whatsapp = await WhatsApp.find({});
        res.status(200).json({ whatsapp });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const deleteWhatsApp = async (req, res) => {
    try {
        const { id } = req.params;
        const whatsapp = await WhatsApp.findById(id);
        if (!whatsapp) {
            return res.status(404).json({ message: "Whatsapp not found" });
        }
        await WhatsApp.deleteOne({ _id: id });
        res.status(200).json({ message: "Whatsapp deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addAssignment = async (req, res) => {
    try {
        const { title, description, link, optional, districtRule, taskForce, date } = req.body;
        let imageObj = req.file;

        const assignment = await Assignment.create({
            title,
            description,
            link,
            image: `${process.env.DOMAIN}/AssignmentImage/${imageObj.filename}` || "",
            optional,
            districtRule,
            taskForce,
            date: date
        })
        await assignment.save();
        res.status(200).json({ message: "Assignment added successfully", assignment });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.find({});
        res.status(200).json({ assignment });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        await Assignment.deleteOne({ _id: id });
        res.status(200).json({ message: "Assignment deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getVolunteerAppLink = async (req, res) => {
    try {
        const volunteerAppLink = await AppLink.find({});
        res.status(200).json({ volunteerAppLink });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const addVolunteerAppLink = async (req, res) => {
    try {
        const { name, link } = req.body;
        const volunteerAppLink = await AppLink.create({
            name,
            link
        })
        await volunteerAppLink.save();
        res.status(200).json({ message: "Volunteer App Link added successfully", volunteerAppLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal server error" })
    }
}

const deleteVolunteerAppLink = async (req, res) => {
    try {
        const { id } = req.params;
        const volunteerAppLink = await AppLink.findById(id);
        if (!volunteerAppLink) {
            return res.status(404).json({ message: "Volunteer App Link not found" });
        }
        await AppLink.deleteOne({ _id: id });
        res.status(200).json({ message: "Volunteer App Link deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addHistory = async (req, res) => {
    try {
        const { title, description, link, optional, year, party, election_type, no_of_votes, no_of_voters,district,loksabha,assembly,constituency,booth } = req.body;
        const history = await History.create({
            title,
            description,
            link,
            optional,
            year,
            party,
            election_type,
            no_of_votes,
            no_of_voters,
            district,
            loksabha,
            assembly,
            constituency,
            booth
        })
        await history.save();
        res.status(200).json({ message: "History added successfully", history });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const getHistory = async (req, res) => {
    try {
        const {district,loksabha,assembly,constituency,booth} = req.query
        let query = {};
        if(district){
            query.district = district
        }
        if(loksabha){
            query.loksabha = loksabha
        }
        if(assembly){
            query.assembly = assembly
        }
        if(constituency){
            query.constituency = constituency
        }
        if(booth){
            query.booth = booth
        }
        const history = await History.find(query);
        res.status(200).json({ history });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await History.findById(id);
        if (!history) {
            return res.status(404).json({ message: "History not found" });
        }
        await History.deleteOne({ _id: id });
        res.status(200).json({ message: "History deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addAds = async (req, res) => {
    try {
        const { name, link, kind } = req.body;
        const imageObj = req.file;
        const ads = await Ads.create({
            name,
            link,
            image: `${process.env.DOMAIN}/AdsImage/${imageObj.filename}`,
            kind
        })
        await ads.save();
        res.status(200).json({ message: "Ads added successfully", ads });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const getAds = async (req, res) => {
    try {
        const ads = await Ads.find({});
        res.status(200).json({ ads });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const deleteAds = async (req, res) => {
    try {
        const { id } = req.params;
        const ads = await Ads.findById(id);
        if (!ads) {
            return res.status(404).json({ message: "Ads not found" });
        }
        await Ads.deleteOne({ _id: id });
        res.status(200).json({ message: "Ads deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addPolingParty = async (req, res) => {
    try {
        const { district, assembly, constituency, booth, name, party, optional, loksabha, symbol } = req.body;
        const imageObj = req.file;
        const polingParty = await VotePolling.create({
            district,
            assembly: assembly || "",
            constituency: constituency || "",
            booth: booth || "",
            name,
            party,
            image: `${process.env.DOMAIN}/PolingImage/${imageObj.filename}`,
            optional,
            loksabha,
            symbol
        })
        await polingParty.save();
        res.status(200).json({ message: "Poling Party added successfully", polingParty });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const getPolingParty = async (req, res) => {
    try {
        const { district, assembly, constituency, booth, loksabha } = req.query;
        const query = {}
        if (district) query.district = district
        if (assembly) query.assembly = assembly
        if (constituency) query.constituency = constituency
        if (booth) query.booth = booth
        if (loksabha) query.loksabha = loksabha
        const polingParty = await VotePolling.find(query);
        res.status(200).json(polingParty);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const deletePolingParty = async (req, res) => {
    try {
        const { id } = req.params;
        const polingParty = await VotePolling.findById(id);
        if (!polingParty) {
            return res.status(404).json({ message: "Poling Party not found" });
        }
        await VotePolling.deleteOne({ _id: id });
        res.status(200).json({ message: "Poling Party deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const getStaticsOfPolling = async (req, res) => {
    try {
        const { district, assembly, constituency, booth } = req.query;
        let query = {}
        if (district) query.district = district
        if (assembly) query.assembly = assembly
        if (constituency) query.constituency = constituency
        if (booth) query.booth = booth;
        const users = await User.find(query);
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
        res.status(500).json({ error: "internal server error" })
    }
}

const addWhatsAppPublic = async (req, res) => {
    try {
        const { link, booth, assembly, constituency, district, optional, membersNo } = req.body;
        // Check if the link already exists
        const existingLink = await WhatsAppPublic.findOne({ link });
        if (existingLink) {
            return res.status(400).json({ error: "This link is already in use" });
        }

        const whatsAppPublic = await WhatsAppPublic.create({
            link,
            optional,
            booth,
            assembly,
            constituency,
            district,
            membersNo: Number(membersNo) || 0
        })
        await whatsAppPublic.save();
        res.status(200).json({ message: "Whatsapp public added successfully", whatsAppPublic });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const getWhatsAppPublic = async (req, res) => {
    try {
        const { district, assembly, constituency, booth, page, perPage } = req.query; // Default values for page and perPage
        const query = {};

        if (district) query.district = district;
        if (assembly) query.assembly = assembly;
        if (constituency) query.constituency = constituency;
        if (booth) query.booth = booth;

        // Calculate the total count of documents that match the query (before pagination)
        const totalCount = await WhatsAppPublic.countDocuments(query);

        // Find documents that match the query with pagination
        const whatsAppPublic = await WhatsAppPublic.find(query)
            .skip((page - 1) * perPage) // Skips the documents of previous pages
            .limit(perPage); // Limits the number of documents returned

        // Calculating total pages
        const totalPages = Math.ceil(totalCount / perPage);

        res.status(200).json({
            data: whatsAppPublic,
            currentPage: Number(page),
            perPage: Number(perPage),
            totalCount,
            totalPages,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" });
    }
};

const getWhatsAppPublicCount = async (req, res) => {
    try {
        const { district, assembly, constituency, booth } = req.query;
        const query = {}
        if (district) query.district = district
        if (assembly) query.assembly = assembly
        if (constituency) query.constituency = constituency
        if (booth) query.booth = booth
        const whatsAppPublic = await WhatsAppPublic.find(query);
        res.status(200).json(whatsAppPublic.length);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "internal server error" })
    }
}
const deleteWhatsAppPublic = async (req, res) => {
    try {
        const { id } = req.params;
        const whatsAppPublic = await WhatsAppPublic.findById(id);
        if (!whatsAppPublic) {
            return res.status(404).json({ message: "Whatsapp public not found" });
        }
        await WhatsAppPublic.deleteOne({ _id: id });
        res.status(200).json({ message: "Whatsapp public deleted successfully" });
    } catch {
        console.error("Error deleting :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// const addDataFromJson = async (req, res) => {
//     try {
//         const { district, constituency, assembly, booth, caste, infavour, voterStatus } = req.body;
//         const jsonData = JSON.parse(req.file.buffer.toString());

//         function renameKeys(obj, newKeys) {
//             const keyValues = Object.keys(obj).map(key => {
//                 let newKey = key;
//                 let value = obj[key];

//                 if (key.includes(" : ")) {
//                     // Split key into separate key and value
//                     const [newKeyName, newValue] = key.split(" : ");
//                     newKey = newKeyName.trim(); // Remove any leading/trailing spaces
//                     value = newValue.trim(); // Remove any leading/trailing spaces
//                 } else if (key.startsWith("പ്രായം")) {
//                     const value = key.split(" : ")[1];
//                     newKey = "age";
//                 }

//                 // Check for additional characters like semicolons, commas, single quotes, and spaces
//                 if (newKey.includes(" ; ")) {
//                     newKey = newKey.split(" ; ")[1].trim(); // Extract the desired key
//                 } else if (newKey.includes(" , ")) {
//                     newKey = newKey.split(" , ")[1].trim(); // Extract the desired key
//                 } else if (newKey.includes(" ' ")) {
//                     newKey = newKey.split(" ' ")[1].trim(); // Extract the desired key
//                 }
//                 newKey = newKeys[newKey] || newKey;
//                 // Transform gender field values
//                 if (newKey === "gender") {
//                     if (value.includes("സ്ത്രീ")) {
//                         value = "F";
//                     } else if (value.includes("പുരുഷന്‍")) {
//                         value = "M";
//                     } else {
//                         value = "N";
//                     }
//                 }


//                 return { [newKey]: value };
//             });
//             return Object.assign({}, ...keyValues);
//         }

//         // Define new key names
//         const newKeyNames = {
//             "പേര്‌": "name",
//             "പൌര": "name",
//             "പേര": "name",
//             "പേ": "name",
//             "അമ്മയുടെ പേര്‍": "guardianName",
//             "അച്ഛന്റെ പേര്‌": "guardianName",
//             "അച്ചന്റെ പേര്‌": "guardianName",
//             "വിട്ടു നമ്പര്‍": "houseName",
//             "വീട്ടു നമ്പര്‍": "houseName",
//             "വീട്ടു പ": "houseName",
//             "ഭര്‍ത്താവിന്റെ പേര്": "guardianName",
//             "ഭര്‍ത്താവിന്റെ പേര്‌": "guardianName",
//             "അമ്മയുടെ പേര്‌": "guardianName",
//             "അച്ഛന്റെ പേര": "guardianName",
//             "അമ്മന്മുടെ പേര്‌": "guardianName",
//             "പ്രായം": "age",
//             "ലിംഗം": "gender",
//             'SL Number': "sNo",
//             "VoterID": "voterId",
//         };

//         const modifiedData = jsonData.map(obj => renameKeys(obj, newKeyNames));
//         modifiedData.map(async (data) => {
//             let newName = "";
//             let newGuardianName = "";
//             let newHouseName = "";
//             try {
//                 newName = ml2en(data.name);
//                 newGuardianName = ml2en(data.guardianName);
//                 newHouseName = ml2en(data.houseName);
//             } catch (e) {
//                 console.log("Error", e);
//             }
//             const existingUser = await User.findOne({ voterId: data.voterId });
//             if (!existingUser) {
//                 User.create({
//                     sNo: data.sNo,
//                     name: newName,
//                     guardianName: newGuardianName,
//                     houseNo: data.houseNo || "",
//                     houseName: newHouseName,
//                     gender: data.gender,
//                     age: data.age,
//                     voterId: data.voterId,
//                     district,
//                     constituency,
//                     assembly,
//                     booth,
//                     whatsappNo: data.whatsappNo || "",
//                     phone: data.phone || "",
//                     email: data.email || "",
//                     infavour: infavour || data.infavour || "",
//                     caste: caste || data.caste || "",
//                     voterStatus: voterStatus || data.voterStatus || "",
//                 });
//             }
//         });

//         res.status(200).json(modifiedData);
//     } catch (error) {
//         console.error('Error handling file upload:', error.message);
//         res.status(500).json({ error: 'Failed to handle file upload' });
//     }
// };
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

     
       
        jsonData.map(async (data) => {
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
                    booth,
                    whatsappNo: data.whatsappNo || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    infavour: infavour || data.infavour || "",
                    caste: caste || data.caste || "",
                    voterStatus: voterStatus || data.voterStatus || "",
                    updatedBy: [volunteer._id],
                });
            }
        });

        res.status(200).json(modifiedData);
    } catch (error) {
        console.error('Error handling file upload:', error.message);
        res.status(500).json({ error: 'Failed to handle file upload' });
    }
};
const loginFromApp = async (req, res) => {
    try {
        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const token = jwt.sign({ id: admin[0]._id }, jwtSecret);
        res.status(200).json(token);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const sendNotificationWithDistrict = async (req, res) => {

    try {
        const { title, url, district, assembly, constituency } = req.body;
        const query = {};
        if (district) {
            query.district = district;
        }
        if (assembly) {
            query.assembly = assembly;
        }
        if (constituency) {
            query.constituency = constituency;
        }

        const imageObj = req.file;
        const users = await Volunteer.find(query);
        if (!users) {
            throw new Error('No users found');
        }
        // Retrieve all tokens from the Notification model
        const allTokens = await Notification.find({ userId: { $in: users.map(user => user._id) } }).distinct('token');
        if (!allTokens) {
            throw new Error('No tokens found');
        }

        // Build the payload
        const payload = {
            registration_ids: allTokens,
            notification: {
                body: title,
                title: `${process.env.SITE_NAME}`,
            },
            data: {
                url: url,
            },
        };

        // Add image property to data if imageObj exists
        if (imageObj) {
            payload.notification.image = `${process.env.DOMAIN}/OneImage/${imageObj.filename}`;
        }

        console.log(JSON.stringify(payload));

        const result = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await result.json();

        // Check for errors in the HTTP response
        if (!result.ok) {
            throw new Error(`FCM request failed with status ${result.status}: ${data}`);
        }

        const date = new Date().toString().trim("T");

        // Use Promise.all to await both the fetch and the creation of NotificationList concurrently
        await Promise.all([
            NotificationList.create({ title: title, image: imageObj ? `${process.env.DOMAIN}/OneImage/${imageObj.filename}` : null, url: url, date: date }),
            res.status(200).json({ message: 'Notification sent successfully', data }),
        ]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getNotifications = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skipIndex = (page - 1) * limit;

    try {
        const notifications = await NotificationList.find()
            .sort({ _id: -1 }) // Sorting in descending order
            .limit(limit)
            .skip(skipIndex)
            .exec();

        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await NotificationList.findOneAndDelete({ _id: req.params.id });
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.status(200).json({ msg: "notification removed" });
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const LoginFromDCCAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const token = jwt.sign({ id: admin._id }, jwtSecret);
        res.status(200).json(token);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}
const getCasteV2 = async (req, res) => {
    try {
        const castes = [{
            caste: "Hindu",
            caste_types: [

                "Ezhava",
                "Nair",
                "Brahmin",
                "Vishwakarma",
                 "SC",
                "ST",
                "OBC",

            ]
        }, {
            caste: "Muslim",
            caste_types: [
                "Muslim",
            ]
        },
        {
            caste: "Christian",
            caste_types: [
                "RC",
                "Latin",
                "Jewish",
            ]
        }]
        res.status(200).json(castes);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}
const addJsonFromPdf = async (req, res) => {
    try {
        const { data, booth,district,assembly,constituency } = req.body;
        if (!data) {
            return res.status(400).json({ error: "Data not found" });
        }
     
        const pdfData = data;
        const result = await pdfData.map(async (dat) => {
            if (!data) {
                return
            }
            const user = await User.findOne({ voterId: dat.voterId });

            if (!user) {
                await User.create({
                    voterId: dat.voterId,
                    district: district,
                    constituency: constituency,
                    assembly: assembly,
                    booth: booth,
                    name: dat.name,
                    houseNo: dat.houseNo,
                    houseName: dat.houseName,
                    age: dat.age,
                    gender: dat.gender,
                    sNo: dat.sNo,
                    guardianName: dat.guardianName,
                    uploadedBy: "admin",
                    updatedBy:["admin"],
                })
            }
        })
        res.status(200).json({ message: "Data added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
module.exports = {
    Login,
    Protected,
    CreateVolunteer,
    UpdateVolunteer,
    DeleteVolunteer,
    VerifyVolunteer,
    getVolunteers,
    getVolunteersNotVerified,
    getVolunteerById,
    getUserById,
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    deleteBulkUsers,
    addUserFromExcel,
    getUsersByDistrict,
    getStateDistrictV1,
    AddStateBooth,
    AddStateConstituency,
    AddStateAssembly,
    AddStateDistrict,
    DeleteStateBooth,
    DeleteStateConstituency,
    DeleteStateAssembly,
    DeleteStateDistrict,
    VerifyVolunteerFromApp,
    getInfavour,
    addInfavour,
    deleteInfavour,
    addCaste,
    getCaste,
    deleteCaste,
    addSwing,
    getSwing,
    deleteSwing,
    addCarousel,
    getCarousel,
    deleteCarousel,
    addDailyNews,
    getDailyNews,
    deleteDailyNews,
    addWhatsApp,
    getWhatsApp,
    deleteWhatsApp,
    addAssignment,
    getAssignment,
    deleteAssignment,
    getVolunteerAppLink,
    addVolunteerAppLink,
    deleteVolunteerAppLink,
    getHistory,
    addHistory,
    deleteHistory,
    getAds,
    addAds,
    deleteAds,
    getPolingParty,
    addPolingParty,
    deletePolingParty,
    getStaticsOfPolling,
    addWhatsAppPublic,
    getWhatsAppPublic,
    getWhatsAppPublicCount,
    deleteWhatsAppPublic,
    addDataFromJson,
    loginFromApp,
    sendNotificationWithDistrict,
    getNotifications,
    deleteNotification,
    LoginFromDCCAdmin,
    getCasteV2,
    addJsonFromPdf

}
