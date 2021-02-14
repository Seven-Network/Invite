const https = require('https');
const WebSocket = require('ws');
const messagePack = require('messagepack');
require('dotenv').config();

const server = https.createServer();

const wss = new WebSocket.Server({ server });

const lobbies = [];

class Lobby {
  constructor(roomID) {
    this.roomID = roomID;
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
    console.log(`${user.playerName} joined ${this.roomID}`);
  }
}

class LobbyUser {
  constructor(playerName, ws) {
    this.playerName = playerName;
    this.ws = ws;
  }
}

wss.on('open', (ws) => {
  console.log('Handling new connection...');

  ws.on('message', (raw) => {
    const data = messagePack.decode(raw);

    if (data[0] == 'auth') {
      const user = new LobbyUser(data[2], ws);

      const lobby = lobbies.find((val) => {
        if (val.roomID == auth[1]) return true;
      });

      if (lobby) {
        lobby.addUser(user);
      } else {
        const newLobby = new Lobby(data[1]);
        lobbies.push(newLobby);
        newLobby.addUser(user);
      }
    }
  });
});

server.listen(process.env.PORT || 7778, () => {
  console.log(`Server running at port ${process.env.PORT || 7778}`);
});
