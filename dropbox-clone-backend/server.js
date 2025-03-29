require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// File storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API endpoint to upload files
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', file: req.file });
});

// API endpoint to list files with stats
app.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir('uploads/');
    const filesWithStats = await Promise.all(files.map(async file => {
      const stats = await fs.stat(path.join('uploads', file));
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime,
        path: path.join('uploads', file)
      };
    }));
    res.json(filesWithStats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// API endpoint to delete files
app.delete('/files/:filename', async (req, res) => {
  try {
    const filePath = path.join('uploads', req.params.filename);
    await fs.unlink(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// API endpoint to browse local filesystem
app.get('/browse', async (req, res) => {
  try {
    const dirPath = req.query.path || process.env.HOME || '/';
    const items = await fs.readdir(dirPath);
    const itemsWithStats = await Promise.all(items.map(async item => {
      const fullPath = path.join(dirPath, item);
      const stats = await fs.stat(fullPath);
      return {
        name: item,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime,
        path: fullPath
      };
    }));
    res.json(itemsWithStats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to browse directory' });
  }
});

// Admin credentials (in production, use environment variables)
const adminUsers = {
  [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || bcrypt.hashSync('admin123', 10)
};

// Authentication middleware
app.use('/admin', basicAuth({
  users: adminUsers,
  challenge: true,
  realm: 'Dropbox Clone Admin',
  authorizeAsync: true,
  authorizer: (username, password, cb) => {
    const userExists = adminUsers[username];
    if (!userExists) return cb(null, false);
    
    bcrypt.compare(password, adminUsers[username], (err, res) => {
      cb(null, res);
    });
  }
}));

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
