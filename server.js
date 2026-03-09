const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection
const db = process.env.MONGO_URI || 'mongodb+srv://raviraj7301325_db_user:raviraj7301325_db_user@cluster0.dulqxjp.mongodb.net/?appName=Cluster0';

mongoose.connect(db)
  .then(() => console.log('MongoDB Connected to Todo DB...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

// Start Server
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});