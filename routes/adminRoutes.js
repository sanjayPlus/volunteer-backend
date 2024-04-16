const router = require("express").Router();
const adminController = require("../controllers/adminController");
const multer = require('multer');
const adminAuth = require("../middlewares/adminAuth");
const userController = require("../controllers/userController");
const districtController = require("../controllers/districtController");
const path = require('path');
const appServerAuth = require("../middlewares/appServerAuth");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//Carousel image 
const CarouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/CarouselImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const carouselImage = multer({
    storage: CarouselStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

//end
//daily news image 
const DailyNewsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/DailyNewsImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const dailyNewsImage = multer({
    storage: DailyNewsStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

//end
//assignments
const AssignmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/AssignmentImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const AssignmentImage = multer({
    storage: AssignmentStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

//ads
const AdsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/AdsImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const AdsImage = multer({
    storage: AdsStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
const PolingStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/PolingImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const PolingImage = multer({
    storage: PolingStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
  const OneStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/OneImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const OneImage = multer({
    storage: OneStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
router.post("/login", adminController.Login);
router.get('/protected',adminAuth,adminController.Protected);
router.post("/create-volunteer",adminAuth, adminController.CreateVolunteer);
router.post("/update-volunteer",adminAuth, adminController.UpdateVolunteer);
router.delete("/delete-volunteer/:id",adminAuth, adminController.DeleteVolunteer);
router.put("/verify-volunteer/:id",adminAuth, adminController.VerifyVolunteer);
router.get('/volunteers', adminAuth,adminController.getVolunteers);
router.get('/volunteer/:id',adminAuth, adminController.getVolunteerById);
router.get('/volunteers-not-verified',adminAuth, adminController.getVolunteersNotVerified);


router.get('/users',adminAuth,adminController.getUsers);
router.get('/user/:id',adminAuth,adminController.getUserById);
router.delete('/delete-user/:id',adminAuth,adminController.deleteUser);
router.post("/add-user-from-excel",adminAuth,upload.single('excel'), adminController.addUserFromExcel);
router.post('/add-user',adminAuth,adminController.addUser);
router.put('/update-user/:id',adminAuth,adminController.updateUser);
router.get("/district/:district",adminAuth, adminController.getUsersByDistrict);
router.get('/state-districtV1', adminController.getStateDistrictV1);

//add crd api for distrist and contituency assembly and booth
router.post('/add-state-district', adminAuth,adminController.AddStateDistrict);
router.post('/add-state-constituency', adminAuth,adminController.AddStateConstituency);
router.post('/add-state-assembly', adminAuth, adminController.AddStateAssembly);
router.post('/add-state-booth', adminAuth, adminController.AddStateBooth);

router.post('/delete-state-booth', adminAuth, adminController.DeleteStateBooth);
router.post('/delete-state-assembly', adminAuth, adminController.DeleteStateAssembly);
router.post('/delete-state-constituency', adminAuth, adminController.DeleteStateConstituency);
router.post('/delete-state-district', adminAuth, adminController.DeleteStateDistrict);


router.get('/districtV4',districtController.getDistrictV4);
router.get('/mandalam',districtController.getMandalam);

router.post('/mandalam',adminAuth,districtController.addMandalam);
router.post('/add-district',adminAuth,districtController.addDistrict);
router.post('/add-constituency',adminAuth,districtController.addConstituency);
router.post('/add-assembly',adminAuth,districtController.addAssembly);
router.post('/add-panchayath',adminAuth,districtController.addPanchayath);
router.post('/add-corporation',adminAuth,districtController.addCorporation);
router.post('/add-municipality',adminAuth,districtController.addMunicipality);

router.post('/delete-district',adminAuth,districtController.deleteDistrict);
router.post('/delete-constituency',adminAuth,districtController.deleteConstituency);
router.post('/delete-assembly',adminAuth,districtController.deleteAssembly);
router.post('/delete-panchayath',adminAuth,districtController.deletePanchayath);
router.post('/delete-corporation',adminAuth,districtController.deleteCorporation);
router.post('/delete-municipality',adminAuth,districtController.deleteMunicipality);
router.delete('/mandalam/:id',adminAuth,districtController.deleteMandalam);

router.get('/infavour',adminController.getInfavour);
router.post('/add-infavour',adminAuth,adminController.addInfavour);
router.delete('/delete-infavour/:id',adminAuth,adminController.deleteInfavour);

router.post('/caste',adminAuth,adminController.addCaste);
router.get('/caste',adminController.getCaste);
router.delete('/caste/:id',adminAuth,adminController.deleteCaste);

router.post('/carousel',carouselImage.single('image'),adminAuth,adminController.addCarousel);
router.get('/carousel',adminController.getCarousel)
router.delete('/carousel/:id',adminAuth,adminController.deleteCarousel)

router.post('/daily-news',dailyNewsImage.single('image'),adminAuth,adminController.addDailyNews);
router.get('/daily-news',adminController.getDailyNews);
router.delete('/daily-news/:id',adminAuth,adminController.deleteDailyNews)

router.post('/swing',adminAuth,adminController.addSwing);
router.get('/swing',adminController.getSwing);
router.delete('/swing/:id',adminAuth,adminController.deleteSwing);

router.post('/whatsapp',adminAuth,adminController.addWhatsApp);
router.get('/whatsapp',adminAuth,adminController.getWhatsApp);
router.delete('/whatsapp/:id',adminAuth,adminController.deleteWhatsApp);

router.post('/assignment',AssignmentImage.single('image'),adminAuth,adminController.addAssignment);
router.get('/assignments',adminAuth,adminController.getAssignment);
router.delete('/assignment/:id',adminAuth,adminController.deleteAssignment);

router.post('/add-app-link',adminAuth,adminController.addVolunteerAppLink);
router.get('/app-link',adminController.getVolunteerAppLink);
router.delete('/app-link/:id',adminAuth,adminController.deleteVolunteerAppLink);

router.get('/history',adminController.getHistory);
router.post('/add-history',adminAuth,adminController.addHistory);
router.delete('/history/:id',adminAuth,adminController.deleteHistory);

router.get('/ads',adminController.getAds);
router.post('/add-ads',AdsImage.single('image'),adminAuth,adminController.addAds);
router.delete('/ads/:id',adminAuth,adminController.deleteAds);

router.post('/add-poling-party',adminAuth,PolingImage.single('image'),adminController.addPolingParty);
router.get('/poling-party',adminController.getPolingParty);
router.delete('/poling-party/:id',adminAuth,adminController.deletePolingParty);

router.get('/get-statistics-polling-party',adminAuth,adminController.getStaticsOfPolling);

router.post('/add-whatsapp-public',adminAuth,adminController.addWhatsAppPublic);
router.get('/whatsapp-public',adminController.getWhatsAppPublic);
router.get('/whatsapp-public-count',adminController.getWhatsAppPublicCount);
router.delete('/whatsapp-public/:id',adminAuth,adminController.deleteWhatsAppPublic);

router.post('/add-data-from-json',upload.single('excel'),adminController.addDataFromJson);
router.get('/login-from-app',appServerAuth,adminController.loginFromApp);

router.post('/send-notification-with-district',OneImage.single('image'),adminAuth,adminController.sendNotificationWithDistrict);
router.get('/notifications',adminAuth,adminController.getNotifications);
router.delete('/notification/:id',adminAuth,adminController.deleteNotification);

router.get('/login-from-dcc',appServerAuth,adminController.LoginFromDCCAdmin);

router.get('/get-caste-v2',adminController.getCasteV2);

router.post('/admin-upload-pdf',adminAuth,adminController.addJsonFromPdf);

router.post('/letter',adminAuth,adminController.addletter);
router.get('/letter',adminController.getletter);
router.delete('/letter/:id',adminAuth,adminController.deleteletter);
module.exports = router;
