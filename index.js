const express = require('express');
const line = require('@line/bot-sdk');

const mongoose = require("mongoose");

const Message = require("./models/Message");

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
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  // 💾 บันทึกลง MongoDB
  await Message.create({
    userId: event.source.userId,
    message: event.message.text
  });

  console.log("Saved to MongoDB ✅");

  const echo = { 
    type: 'text', 
    text: "บันทึกข้อความแล้ว ✅" 
  };

  return client.replyMessage(event.replyToken, echo);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});