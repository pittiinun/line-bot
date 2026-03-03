const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: 'UNLcgjfEvGNEcrUuhQPGmYwLrFG0cMsP5WGRyM7tczaoqK02ZbbCJuTt53jR4bKjYJ6DurypNqTXHFFgIjpO9TmHYqRei+xj9PBP+jfW2PTpuEc/Ps/1YzKDMiUiBULSULC1K0IC4qzc9VwGVooxFgdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'b2cc7caa20f6f8eeec32b6e599eb1eb4'
};

const app = express();
const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  res.status(200).end();

  Promise
    .all(req.body.events.map(handleEvent))
    .catch(err => console.error(err));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const echo = { type: 'text', text: event.message.text };
  return client.replyMessage(event.replyToken, echo);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});