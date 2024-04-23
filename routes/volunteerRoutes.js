const router = require("express").Router();
const volunteerController = require("../controllers/volunteerController");
const adminController = require("../controllers/adminController");
const volunteerAuth = require("../middlewares/volunteerAuth");
const userController = require("../controllers/userController");
const Volunteer = require("../models/Volunteer");
const appServerAuth = require("../middlewares/appServerAuth");
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.put('/update-user/:userId',  volunteerAuth, volunteerController.UpdateUser);
router.put('/update-volunteer/:id',volunteerAuth, volunteerController.updateVolunteer);
router.delete('/delete-user/:id',volunteerAuth, volunteerController.DeleteUser);
router.get('/users', volunteerAuth,volunteerController.getUsers);
router.get('/users-count', volunteerAuth,volunteerController.getUsersCount);
router.get('/volunteer-details',volunteerAuth, volunteerController.getVolunteerDetails);
router.get('/protected',volunteerAuth,volunteerController.Protected);
router.get('/download-logo',volunteerAuth, volunteerController.getVolunteerLogo);
router.get('/download-logoV2', volunteerAuth,volunteerController.getVolunteerLogoV2);
router.get('/assignments',volunteerAuth,volunteerController.getAssignments);
router.get('/whatsapp',volunteerAuth,volunteerController.getWhatsAppByPower);
router.get('/polling-party',volunteerAuth,volunteerController.getPollingparty);
router.get('/statistics-of-polling',volunteerAuth,volunteerController.getStaticsOfPolling);
router.get('/get-polling-party-by-volunteer',volunteerAuth,volunteerController.getPollingPartyByVolunteer);
router.get('/get-house-names',volunteerAuth,volunteerController.getHouseNameWithUsers);

router.post("/login", volunteerController.volunteerLogin);
router.post("/add-user",volunteerAuth,volunteerController.addUser);
router.get('/user/:id',volunteerAuth, volunteerController.getUserById);

router.post("/forget-password", volunteerController.forgetPassword);
router.post("/verify-otp", volunteerController.verifyForgotPasswordOTP);
router.post("/reset-password",volunteerAuth, volunteerController.resetPassword);
router.post('/register',volunteerController.register);
router.post('/register-from-app',appServerAuth,volunteerController.registerFromApp);
router.post('/add-user-from-excel',upload.single('excel'),volunteerAuth,volunteerController.addUserFromExcel);
router.post('/delete-bulk-user',volunteerAuth,volunteerController.BulkDeleteUser);
router.post('/login-from-app',appServerAuth,volunteerController.loginFromApp);
router.post('/add-assignment-completed',volunteerAuth,volunteerController.addAssignmentCompleted);
router.get('/get-assignments-completed',volunteerAuth,volunteerController.getAssignmentsCompleted);
router.post('/delete-assignment-completed',volunteerAuth,volunteerController.deleteAssignmentCompleted);
router.post('/add-report',volunteerAuth,volunteerController.addReport);
router.post('/add-data-from-json',upload.single('file'),volunteerAuth,volunteerController.addDataFromJson);
router.post('/add-notification-token',volunteerAuth,volunteerController.storeNotificationToken);
router.get('/notifications',volunteerAuth,adminController.getNotifications);

router.post('/add-whatsapp-public',volunteerAuth,volunteerController.addWhatsAppPublic);
router.get('/get-statics-of-voting-day',volunteerAuth,volunteerController.getStaticsOfVotingDay);

router.post('/volunteer-upload-pdf',volunteerAuth,volunteerController.addJsonFromPdf);

router.get('/get-statics-by-house',volunteerAuth,volunteerController.getStaticsByHouseName);
router.post('/create-non-eligible-user',volunteerAuth,volunteerController.CreateNonEligibleUser);


router.get('/get-blog',volunteerAuth,volunteerController.getBlog);

router.post('/add-blog',volunteerAuth,volunteerController.addBlog);
router.delete('/delete-blog/:id',volunteerAuth,volunteerController.deleteBlog);

router.get('/get-calendar',volunteerAuth,volunteerController.getCalendar);
router.post('/add-calendar',volunteerAuth,volunteerController.addCalendar);
router.delete('/delete-calendar/:id',volunteerAuth,volunteerController.deleteCalendar);

router.post('/add-history',volunteerAuth,volunteerController.addHistory);
router.get('/get-history',volunteerAuth,volunteerController.getHistory);
router.delete('/delete-history/:id',volunteerAuth,volunteerController.deleteHistory);


module.exports = router;
