const mongoose = require('mongoose');
const ora = require('ora');

const connectDB = async () => {
  const spinner = ora('Connecting to MongoDB...').start();

  try {
    await mongoose.connect(process.env.MONGO_URI);
    spinner.succeed('✅ MongoDB connected');
  } catch (err) {
    spinner.fail('❌ MongoDB connection failed');
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;