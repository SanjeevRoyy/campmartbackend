const express = require('express');
const { login, signup } = require('../controllers/authController');
const verifyOtp = require('../controllers/verifyOtpController')
const sendOtp = require('../controllers/sendOtpController'); //  sendOtp controller
const resetPassword = require('../controllers/resetPasswordController'); //  resetPassword controller

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/sendotp', sendOtp); // Route for sending OTP
router.post('/verifyotp',verifyOtp);
router.post('/resetpassword', resetPassword); // Route for resetting password

module.exports = router;
