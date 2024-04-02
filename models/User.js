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
    mandalam:{
        type:String,
        default:""
    },
    aadhaar:{
        type:String,
        default:""
    },
    aadhaarNo:{
        type:String,
        default:""
    },
    assembly:{
        type:String,
        default:""
    },
    constituency:{
        type:String,
        default:""
    },
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
    ward:{
        type:String,
        default:""
    },
    date_of_birth:{
        type:String,
        default:""
    },
    booth:{
        type:String,
        default:""
    },
    caste:{
        type:String,
        default:""
    },
    casteType:{
        type:String,
        default:""
    },
    profession:{
        type:String,
        default:""
    },
    voterId:{
        type:String,
        default:""
    },
    whatsappNo:{
        type:String,
        default:""
    },
    voterStatus:{
        type:String,
        default:""
    },
    infavour:{
        type:String,
        default:""
    },
    houseNo:{
        type:String,
        default:""
    },
    houseName:{
        type:String,
        default:""
    },
    guardianName:{
        type:String,
        default:""
    },
    gender:{
        type:String,
        default:""
    },
    age:{
        type:String,
        default:""
    },
    sNo:{
        type:String,
        default:""
    },
    localBody:String,
    verified:{
        type:Boolean,
        default:false
    },
    swingVote:String,
    year:{
        type:String,
        default:""
    },
    marriedStatus:{
        type:String,
        default:""
    },
    votingDay:{
        type:String,
        default:""
    },
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
            enum:["hardcore","swing",""],
            default:""
        },
        partyName:{
            type:String,
            default:""
        }
    },
    facebook:{
        type:String,
        default:""
    },
    instagram:{
        type:String,
        default:""
    },
    updatedBy:Array,
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