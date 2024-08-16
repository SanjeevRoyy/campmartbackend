const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  let success = false;
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      // Compare provided password with stored hashed password
      const passCompare = await bcrypt.compare(req.body.password, user.password);

      if (passCompare) {
        // Generate JWT token
        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' }); // Added expiration

        success = true;
        res.json({ success, token });
      } else {
        res.status(400).json({ success, errors: 'Invalid email or password' });
      }
    } else {
      res.status(400).json({ success, errors: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success, errors: 'Internal server error' });
  }
};

const signup = async (req, res) => {
  let success = false;
  try {
    // Check if user already exists
    const check = await User.findOne({ email: req.body.email });

    if (check) {
      return res.status(400).json({ success, errors: 'User already exists with this email' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    const user = new User({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword, // Store hashed password
      cartData: cart,
    });

    await user.save();

    // Generate JWT token
    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' }); // Added expiration

    success = true;
    res.json({ success, token });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success, errors: 'Internal server error' });
  }
};

module.exports = { login, signup };
