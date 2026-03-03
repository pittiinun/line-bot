const express = require("express");
const line = require("@line/bot-sdk");

const mongoose = require("mongoose");



const Homework = require("./models/Homework");



mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const client = new line.Client(config);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/webhook", line.middleware(config), (req, res) => {
  res.status(200).end();
  Promise.all(req.body.events.map(handleEvent));
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  if (event.message.text === "ดูการบ้าน") {
    const userId = event.source.userId;
    const list = await Homework.find({ userId });

    if (list.length === 0) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ยังไม่มีการบ้าน"
      });
    }

    let message = "📚 รายการการบ้าน\n\n";
    list.forEach((hw, i) => {
      message += `${i+1}. ${hw.subject} - ${hw.topic}\nกำหนดส่ง: ${hw.dueDate}\n\n`;
    });

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: message
    });
  }

  return null;
}

app.post("/save-homework", async (req, res) => {
  const { userId, subject, topic, dueDate } = req.body;

  await Homework.create({
    userId,
    subject,
    topic,
    dueDate
  });

  res.json({ success: true });
});

app.get("/get-homework/:userId", async (req, res) => {
  const data = await Homework.find({ userId: req.params.userId });
  res.json(data);
});

app.delete("/delete-homework/:id", async (req, res) => {
  await Homework.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});