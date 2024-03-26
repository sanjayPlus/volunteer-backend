const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,

    },
    password: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    district: {
        type: String,
    },
    mandalam:String,
    aadhaar:String,
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
    booth:String,
    caste:String,
    profession:String,
    voterId:String,
    whatsappNo:String,
    voterStatus:String,
    infavour:String,
    houseNo:String,
    houseName:String,
    guardianName:String,
    gender:String,
    age:String,
    sNo:String,
    localBody:String,
    verified:{
        type:Boolean,
        default:false
    },
    facebook:String,
    swingVote:String,
    year:String,
    marriedStatus:String,
    votingDay:Boolean,
    pollingParty:{
        type:String,
        default:""
    },
    userVotingType:String,
    abroadType:String,
    hardFanVote:String,
    party:{
        partyType:{
            type:String,
            enum:["hardcore","swing"]
        },
        partyName:String
    },
    facebook:{
        type:String,
        default:""
    },
    instagram:{
        type:String,
        default:""
    },
});

// Virtual for age calculation based on date_of_birth
// userSchema.virtual('age').get(function () {
//     if (this.date_of_birth) {
//       const today = new Date();
//       const birthDate = new Date(this.date_of_birth);
//       let age = today.getFullYear() - birthDate.getFullYear();
//       const monthDiff = today.getMonth() - birthDate.getMonth();
//       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//       }
//       return age;
//     }
//     return null; // Return null if date_of_birth is not set
//   });
  
  // Setting the virtual field to appear in JSON
//   userSchema.set('toJSON', { getters: true });

module.exports = mongoose.model("User", userSchema);