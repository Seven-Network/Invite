require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const messagePack = require('messagepack');

const router = require('./router');

global.serverList = JSON.parse(process.env.SERVER_LIST);
global.rooms = [];

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Handling new connection...');

  ws.on('message', (raw) => {
    try {
      const data = messagePack.decode(raw);
      if (data[0] == 'auth') {
        const room = global.rooms.find((val) => {
          if (val.roomID == data[1]) return true;
        });
        if (room) {
          room.addUser(data[2], ws);
        }
      }
    } catch (_) {}
  });

  ws.send(messagePack.encode(['auth', true]));
});

server.listen(process.env.PORT || 7778, () => {
  console.log(`Running on port ${process.env.PORT || 7778}`);
});
