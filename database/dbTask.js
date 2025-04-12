const mongoose = require('mongoose');

const colorEmojis = ['🔴', '🟠', '🟢'];

// Define the schema
const taskSchema = new mongoose.Schema({
  text: String,
  color: String,
  priority: Number, // 0: red, 1: orange, 2: green
  urgent: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  messageId: Number,
});

// Create the model
const Task = mongoose.model('Task', taskSchema);

// Create a task
async function createTask({ text, color, urgent, messageId }) {
  const priority = colorEmojis.indexOf(color);
  if (priority === -1) {
    throw new Error('Invalid color emoji');
  }

  try {
    const newTask = await Task.create({ text, color, urgent, messageId, priority });
    console.log(`🆕 Created task: "${text}" with messageId: ${messageId}`);
    return newTask;
  } catch (err) {
    console.error('❌ Failed to create task:', err.message);
    throw err;
  }
}

// Get tasks for a specific day (defaults to today) it gets all the task from the last 48 hours since date.
async function getTasksByDate() {
    try {
        const tasks = await Task.find({ seen: false }).sort({ createdAt: -1 });
        return tasks;
    } catch (err) {
        console.error('❌ Failed to fetch tasks:', err.message);
        throw err;
    }
}

// Toggle the 'seen' status of a task by message text
async function toggleTaskSeenStatus(message) {
  message = message.replace(/^[•\s]+|[🔴🟠🟢🆕‼️]/g, '').trim();
  console.log(`🔄 Toggling seen status for message: ${message}`);

  try {
    const task = await Task.findOne({ text: message });

    if (!task) {
      console.warn('⚠️ Task not found for message:', message);
      return null;
    }

    task.seen = !task.seen;
    await task.save();
    console.log(`✅ Task "${task.text}" seen status toggled to: ${task.seen}`);
    return task;
  } catch (err) {
    console.error('❌ Failed to toggle task seen status:', err.message);
    throw err;
  }
}

module.exports = {
  createTask,
  getTasksByDate,
  toggleTaskSeenStatus,
};