require('dotenv').config();

const http = require('http');
const WebSocket = require('ws');

const { v4: uuidv4 } = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');

const messagePack = require('messagepack');

const { Room } = require('./room');

const rooms = [];

// -- EXPRESS CONFIGURATION --

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.send('Welcome to the Seven Network invite server ✨');
});

app.post('/create-room', (req, res) => {
  const newRoom = new Room(uuidv4());
  rooms.push(newRoom);
  res.json({
    success: true,
    result: `https://venge.io/#${newRoom.roomID}`,
  });
});

// == EXPRESS CONFIGURATION ==

// -- WEBSOCKET CONFIGURATION --

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Handling new connection...');

  ws.on('message', (raw) => {
    // Handle authentication
    try {
      const data = messagePack.decode(raw);
      if (data[0] == 'auth') {
        const room = rooms.find((val) => {
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

// == WEBSOCKET CONFIGURATION ==

server.listen(process.env.PORT || 7778, () => {
  console.log(`Running on port ${process.env.PORT || 7778}`);
});
