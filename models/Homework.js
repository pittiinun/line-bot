const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  userId: String,
  subject: String,
  topic: String,
  dueDate: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Homework", homeworkSchema);