// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redis = require('redis');
const { promisify } = require('util');
const { MinPriorityQueue } = require('@datastructures-js/priority-queue');

// Initialize app and middleware
const app = express();
app.use(express.json());

// MongoDB connection
//mongoose.connect('mongodb://localhost:27017/taskManager', { useNewUrlParser: true, useUnifiedTopology: true });
// MongoDB connection (updated)
mongoose.connect('mongodb://127.0.0.1:27017/taskManager')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Redis setup
const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

// User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Task schema and model
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
});
const Task = mongoose.model('Task', taskSchema);

// Priority Queue setup
const priorityValues = { low: 1, medium: 2, high: 3 };
const taskQueue = new MinPriorityQueue(task => -priorityValues[task.priority]);

// Middleware for authentication
const auth = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send({ message: 'User registered successfully' });
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ _id: user._id }, 'secret');
  res.send({ token });
});

// Create task
app.post('/tasks', auth, async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  taskQueue.enqueue(task);
  await setAsync('tasks', null); // Invalidate cache
  res.status(201).send(task);
});

// Get tasks with pagination, filtering, and caching
app.get('/tasks', auth, async (req, res) => {
  const { page = 1, limit = 10, priority, status } = req.query;
  let tasks = await getAsync('tasks');

  if (!tasks) {
    const query = {};
    if (priority) query.priority = priority;
    if (status) query.status = status;
    tasks = await Task.find(query)
      .sort({ priority: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    await setAsync('tasks', JSON.stringify(tasks), 'EX', 60);
  } else {
    tasks = JSON.parse(tasks);
  }

  res.send(tasks);
});

// Update task
app.put('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await setAsync('tasks', null); // Invalidate cache
  res.send(task);
});

// Delete task
app.delete('/tasks/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  await setAsync('tasks', null); // Invalidate cache
  res.send({ message: 'Task deleted successfully' });
});

// Unit test example
if (process.env.NODE_ENV === 'test') {
  module.exports = app;
} else {
  // Start server
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}
