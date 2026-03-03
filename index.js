const express = require('express');
const line = require('@line/bot-sdk');

const mongoose = require("mongoose");

const Message = require("./models/Message");

const Homework = require("./models/Homework");

// เก็บสถานะการกรอกของแต่ละ user
const userState = {};

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  res.status(200).end();

  Promise
    .all(req.body.events.map(handleEvent))
    .catch(err => console.error(err));
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  const userId = event.source.userId;
  const text = event.message.text;

  // ===== กดเมนูการบ้าน =====
  if (text === "การบ้าน") {
    userState[userId] = { step: 1 };
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "📚 วิชาอะไร?"
    });
  }

  // ===== กำลังกรอกข้อมูล =====
  if (userState[userId]) {

    // STEP 1: วิชา
    if (userState[userId].step === 1) {
      userState[userId].subject = text;
      userState[userId].step = 2;

      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "📖 เรื่องอะไร?"
      });
    }

    // STEP 2: เรื่อง
    if (userState[userId].step === 2) {
      userState[userId].topic = text;
      userState[userId].step = 3;

      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "📅 กำหนดส่งเมื่อไหร่?"
      });
    }

    // STEP 3: กำหนดส่ง
    if (userState[userId].step === 3) {

      await Homework.create({
        userId,
        subject: userState[userId].subject,
        topic: userState[userId].topic,
        dueDate: text
      });

      delete userState[userId];

      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "✅ บันทึกการบ้านเรียบร้อยแล้ว!"
      });
    }
  }

  return null;
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});