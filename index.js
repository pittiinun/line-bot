require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Homework = require("./models/Homework");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/* =======================
   MongoDB Connect
======================= */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));


/* =======================
   เพิ่มการบ้าน
======================= */
app.post("/add", async (req, res) => {
  try {
    const { userId, subject, topic, dueDate } = req.body;

    const newHomework = new Homework({
      userId,
      subject,
      topic,
      dueDate
    });

    await newHomework.save();
    res.json({ message: "Added ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =======================
   ดึงการบ้าน (เรียงใกล้สุดก่อน)
   และแสดงเฉพาะที่ยังไม่ส่ง
======================= */
app.get("/homework/:userId", async (req, res) => {
  try {
    const data = await Homework.find({
      userId: req.params.userId,
      completed: false
    }).sort({ dueDate: 1 });   // ✅ เรียงวันใกล้สุดก่อน

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =======================
   เช็กว่าส่งแล้ว
======================= */
app.put("/complete/:id", async (req, res) => {
  try {
    await Homework.findByIdAndUpdate(req.params.id, {
      completed: true
    });

    res.json({ message: "Completed ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =======================
   ลบงาน
======================= */
app.delete("/delete/:id", async (req, res) => {
  try {
    await Homework.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ❌" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));