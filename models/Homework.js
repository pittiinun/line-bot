const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
  userId: String,
  subject: String,
  topic: String,
  dueDate: {
    type: Date,          // ✅ เปลี่ยนเป็น Date
    required: true
  },
  completed: {
    type: Boolean,       // ✅ เพิ่มสถานะส่งงาน
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Homework", homeworkSchema);