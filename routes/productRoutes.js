const express = require('express');
const {
  getAllProducts,
  getNewCollections,
  getPopular,
  getRelatedProducts,
  addProduct,
  removeProduct,
  updateProduct,
} = require('../controllers/productController');
const router = express.Router();

router.get('/allproducts', getAllProducts);
router.get('/newcollections', getNewCollections);
router.get('/popular', getPopular);
router.post('/relatedproducts', getRelatedProducts);
router.post('/addproduct', addProduct);
router.post('/removeproduct', removeProduct);
router.post('/updateproduct', updateProduct);

module.exports = router;
