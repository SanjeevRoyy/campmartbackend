const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Updated to point to your server.js
const User = require('../models/User');
const Product = require('../models/Product');

let mongoServer;
let token;
let otp; // Variable to store OTP
let userId; // Variable to store user ID

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Create a user and login to get a token for product tests
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    cartData: {} // Initialize empty cartData
  });
  await user.save();
  userId = user._id; // Store user ID

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
// eSewa API Tests
describe('eSewa API', () => {
    // Create Order Test
    test('POST /api/esewa/create - should create an order and return the form data', async () => {
      const orderData = {
        amount: 500, // Example amount
        // Add any other required order fields here if needed
      };
  
      const res = await request(app)
        .post('/api/esewa/create')
        .send(orderData)
        .set('Authorization', `Bearer ${token}`); // Add token for authentication if required
  
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Order Created Sucessfully');
      expect(res.body.order).toBeDefined();
      expect(res.body.payment_method).toBe('esewa');
      expect(res.body.formData).toBeDefined();
  
      // Verify that formData contains all necessary fields
      expect(res.body.formData.amount).toBe(orderData.amount);
      expect(res.body.formData.signature).toBeDefined();
      expect(res.body.formData.success_url).toBe('http://localhost:4000/api/esewa/success');
      expect(res.body.formData.failure_url).toBe('http://localhost:4000/api/esewa/failure');
      expect(res.body.formData.transaction_uuid).toBeDefined();
      expect(res.body.formData.product_code).toBe('EPAYTEST');
    });
  });
  

describe('Authentication API', () => {
  // Signup Test
  test('POST /auth/signup - should create a new user and return a token', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        username: 'testuser',
        email: 'test123@example.com',
        password: 'password123'
      });
    console.log('Response status:', res.statusCode);
    console.log('Response body:', res.body);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();

    token = res.body.token; // Store the token for further tests
  });

  // Login Test
  test('POST /auth/login - should log in a user and return a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  // Test invalid login
  test('POST /auth/login - should return an error for invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBe('Invalid email or password');
  });

  // Send OTP Test
  test('POST /auth/sendotp - should send OTP to the user email', async () => {
    const SECONDS = 10000;
  jest.setTimeout(700 * SECONDS); // Set timeout to 10 seconds
    const res = await request(app)
      .post('/auth/sendotp')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('OTP sent successfully');

    // Capture the OTP sent in the response if needed for further tests
    otp = res.body.otp; // Assuming the OTP is included in the response, modify if necessary
  });

  // Verify OTP Test
  test('POST /auth/verifyotp - should verify the OTP successfully', async () => {
    const res = await request(app)
      .post('/auth/verifyotp')
      .send({
        email: 'test@example.com',
        otp: otp // Use the OTP obtained from the sendotp test
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('OTP verified successfully');
  });
});

// Cart API Tests
describe('Cart API', () => {
  // Add to Cart Test
  test('POST /cart/addtocart - should add an item to the cart', async () => {
    // Create a product to add to the cart
    const product = new Product({
        id: '123',
      name: 'Test Product',
      description: 'Test Description',
      image: 'testimage.jpg',
      category: 'Test Category',
      new_price: 100,
      old_price: 150
    });
    await product.save();

    const res = await request(app)
      .post('/cart/addtocart')
      .send({
        itemId: product._id
      })
      .set('Authorization', `Bearer ${token}`); // Add token for authentication

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Added');

    // Verify that the item was added to the cart
    const user = await User.findById(userId);
    expect(user.cartData[product._id.toString()]).toBe(1);
  });


});

// Product API Tests
describe('Product API', () => {
  // Add Product Test
  test('POST /products/addproduct - should add a new product', async () => {
    const res = await request(app)
      .post('/products/addproduct')
      .send({
        name: 'Test Product',
        description: 'Test Description',
        image: 'testimage.jpg',
        category: 'Test Category',
        new_price: 100,
        old_price: 150
      })
      .set('Authorization', `Bearer ${token}`); // Add token for authentication

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.name).toBe('Test Product');
  });

  // Get All Products Test
  test('GET /products/allproducts - should get all products', async () => {
    const res = await request(app)
      .get('/products/allproducts')
      .set('Authorization', `Bearer ${token}`); // Add token for authentication

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// Password Reset API Test
describe('Password Reset API', () => {
  // Test successful password reset
  test('POST /auth/resetpassword - should reset the user password successfully', async () => {
    const res = await request(app)
      .post('/auth/resetpassword')
      .send({
        email: 'test@example.com',
        newPassword: 'newpassword123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Password reset successfully');

    // Verify that the new password works
    const user = await User.findOne({ email: 'test@example.com' });
    const isMatch = await bcrypt.compare('newpassword123', user.password);
    expect(isMatch).toBe(true);
  });
});
