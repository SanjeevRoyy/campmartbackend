const express = require('express');
const fetchuser = require('../middleware/authMiddleware');
const {
  addToCart,
  removeFromCart,
  getCart,
} = require('../controllers/userController');
const router = express.Router();

router.post('/addtocart', fetchuser, addToCart);
router.post('/removefromcart', fetchuser, removeFromCart);
router.post('/getcart', fetchuser, getCart);

module.exports = router;
