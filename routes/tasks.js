const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const mongoose = require('mongoose');

let fallbackTasks = [
  { _id: '1', title: 'Buy groceries', completed: false, createdAt: new Date() },
  { _id: '2', title: 'Finish the code review', completed: true, createdAt: new Date() },
  { _id: '3', title: 'Check MongoDB connection', completed: false, createdAt: new Date() }
];
let idCounter = 4;

// Get all tasks
router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([...fallbackTasks].sort((a, b) => b.createdAt - a.createdAt));
  }
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const newTask = {
      _id: String(idCounter++),
      title: req.body.title,
      completed: false,
      createdAt: new Date()
    };
    fallbackTasks.push(newTask);
    return res.status(201).json(newTask);
  }

  const task = new Task({
    title: req.body.title
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task (mark as complete / incomplete)
router.patch('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const taskIndex = fallbackTasks.findIndex(t => t._id === req.params.id);
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });
    if (req.body.completed != null) {
      fallbackTasks[taskIndex].completed = req.body.completed;
    }
    return res.json(fallbackTasks[taskIndex]);
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.body.completed != null) {
      task.completed = req.body.completed;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    fallbackTasks = fallbackTasks.filter(t => t._id !== req.params.id);
    return res.json({ message: 'Task deleted' });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
