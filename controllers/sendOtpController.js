// sendOtpController.js

const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'campusmarketplace297@gmail.com',
    pass: 'axuv ivlm conu vvdi'
  }
});

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP controller function
const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Password Reset',
    html: `<html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #007BFF;">Password Reset OTP</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Please use the following OTP to complete the process:</p>
            <h3 style="font-size: 24px; color: #333;">${otp}</h3>
            <p>This OTP is valid for the next 1 hour. If you did not request a password reset, please ignore this email.</p>
            <p>If you have any questions or need further assistance, feel free to contact us.</p>
            <footer style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
              <p style="font-size: 0.9em; color: #666;">Best regards,</p>
              <p style="font-size: 0.9em; color: #666;">The [Your Company Name] Team</p>
            </footer>
          </div>
        </body>
      </html>` //  HTML content 
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Error sending email' });
    }
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  });
};

module.exports = sendOtp;
