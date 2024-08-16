const Product = require('../models/Product');
const User = require('../models/User');

const getAllProducts = async (req, res) => {
  let products = await Product.find({});
  res.send(products);
};

const getNewCollections = async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  res.send(arr);
};

const getPopular = async (req, res) => {
  let products = await Product.find({ category: 'Electronics' });
  let arr = products.splice(0, 4);
  res.send(arr);
};

const getRelatedProducts = async (req, res) => {
  const { category } = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
};

const addProduct = async (req, res) => {
  console.log(req.body);
  // let products = await Product.find({});
  // let id;
  // if (products.length > 0) {
  //   let last_product = products.slice(-1)[0];
  //   id = last_product.id + 1;
  // } else {
  //   id = 1;
  // }
  // console.log(products);
  const product = new Product({
    // id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price:req.body.new_price,
    old_price: req.body.old_price,
  });
  
  await product.save();
  res.json({ success: true });
};

const removeProduct = async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
};

const updateProduct = async (req, res) => {
  const { id, name, description, image, category, new_price, old_price, available } = req.body;
  try {
    let product = await Product.findOne({ id: id });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    product.name = name || product.name;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.new_price = new_price || product.new_price;
    product.old_price = old_price || product.old_price;
    product.avilable = available !== undefined ? available : product.avilable;
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getNewCollections,
  getPopular,
  getRelatedProducts,
  addProduct,
  removeProduct,
  updateProduct,
};
