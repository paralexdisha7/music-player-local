// index.js

const express = require('express');
const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Configure AWS SDK
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer storage with S3
const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.S3_BUCKET_NAME,
      key: (req, file, cb) => {
        // Validate file type
        if (!file.mimetype.startsWith('audio/')) {
          return cb(new Error('Not an audio file!'), false);
        }
        cb(null, file.originalname); // Use the original file name
      },
    }),
  });
  

// API to get music files from S3
app.get('/api/music', async (req, res) => {
  const params = { Bucket: process.env.S3_BUCKET_NAME, MaxKeys: 10 };
  try {
    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    const musicFiles = data.Contents.map(file => ({
      key: file.Key,
      url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${file.Key}`,
    }));
    res.json(musicFiles);
  } catch (error) {
    console.error('Error fetching music files:', error.message);
    res.status(500).send('Error fetching music files');
  }
});

// API to upload music files to S3
app.post('/api/upload', upload.array('music', 10), (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ message: 'Files uploaded successfully!', files: fileUrls });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// API to delete a music file from S3
app.delete('/api/music/:key', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.params.key, // Get the file key from the URL parameter
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    res.json({ message: 'File deleted successfully!' });
  } catch (error) {
    console.error('Error deleting file:', error.message);
    res.status(500).send('Error deleting file');
  }
});