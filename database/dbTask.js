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
    // Map color emojis to priority numbers
    const priority = colorEmojis.indexOf(color);
    if (priority === -1) {
        throw new Error('Invalid color emoji');
    }       

    try {
        const newTask = await Task.create({ text, color, urgent, messageId, priority });
        return newTask;
    } catch (err) {
        console.error('❌ Failed to create task:', err.message);
        throw err;
    }
}

// Get tasks for a specific day (defaults to today)
async function getTasksByDate(dateStr) {
  try {
    let targetDate;

    if (!dateStr) {
      // Default to today
      targetDate = new Date();
    } else {
      const [day, month, year] = dateStr.split('/').map(Number);
      targetDate = new Date(year, month - 1, day);
    }

    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const tasks = await Task.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    return tasks;
  } catch (err) {
    console.error('❌ Failed to fetch tasks by date:', err.message);
    throw err;
  }
}



// Toggle the 'seen' status of a task by message ID
async function toggleTaskSeenStatus(messageId) {
  try {
    const task = await Task.findOne({ messageId });

    if (!task) {
      console.warn('⚠️ Task not found for messageId:', messageId);
      return null;
    }

    task.seen = !task.seen;
    await task.save();
    console.log(`✅ Task ${messageId} seen status toggled to in DB: ${task.seen}`);
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