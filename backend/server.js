require('dotenv').config();

const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; 


app.use(cors({ origin: '*' })); 

// Configure AWS S3

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME; 

console.log('Attempting to read S3_BUCKET_NAME:', S3_BUCKET_NAME);


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API endpoint for file upload
app.post('/upload-csv', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  if (!S3_BUCKET_NAME) {
      return res.status(500).send("Server configuration error: S3 bucket not specified.");
  }

  const file = req.file;
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `uploads/${Date.now()}_${file.originalname}`, 
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  // Upload file to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading file to S3:', err);
      return res.status(500).send('Error uploading file.');
    }

    console.log('File uploaded successfully to S3:', data.Location);
   
    res.status(200).send({ s3Location: data.Location });
  });
});

app.get('/', (req, res) => {
    res.send('BI Dashboard Backend is running.');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
}); 