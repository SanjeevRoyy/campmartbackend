const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 9000;

if (process.env.NODE_ENV !== 'test') {
  // Connect to Database only if not in test environment
  connectDB();
}

app.use(express.json());
app.use(cors());

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });
app.post('/upload', upload.single('product'), (req, res) => {
  res.json({ success: 1, image_url: `/images/${req.file.filename}` });
});

// Route for Images folder
app.use('/images', express.static('upload/images'));

// Use Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/user', userRoutes);
app.use('/api/esewa', require('./routes/esewaRoutes'));

// ROOT API Route For Testing
app.get('/', (req, res) => {
  res.send('Root');
});

// Starting Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, (error) => {
    if (!error) console.log('Server Running on port ' + port);
    else console.log('Error : ', error);
  });
}

module.exports = app; // Export the app for testing
