const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // ลบอัตโนมัติใน 30 วัน
  }
});

module.exports = mongoose.model("Message", messageSchema);