const { v4: uuidv4 } = require('uuid');
const messagePack = require('messagepack');

class Room {
  constructor(roomID) {
    this.roomID = roomID;
    this.region = 'NA';
    this.users = [];
  }

  addUser(playerName, ws) {
    const user = new RoomUser(playerName, ws, this);
    this.users.push(user);
    console.log(`${user.playerName} joined ${this.roomID}`);
    this.broadcastRoom();
  }

  removeUser(id) {
    const index = this.users.findIndex((val) => {
      if (val.id === id) return true;
      else return false;
    });
    console.log(`${this.users[index].playerName} left ${this.roomID}`);
    this.users.splice(index, 1);
    this.broadcastRoom();
  }

  broadcastRoom() {
    var users = [];
    for (var i = 0; i < this.users.length; i++) {
      users.push(this.users[i].playerName);
    }
    var data = messagePack.encode(['room', users, true, true, false]);
    for (var i = 0; i < this.users.length; i++) {
      this.users[i].ws.send(data);
      if (i == 0)
        var data = messagePack.encode(['room', users, false, true, false]);
    }
  }

  startGame() {
    var data = messagePack.encode(['start']);
    for (var i = 0; i < this.users.length; i++) {
      this.users[i].ws.send(data);
    }
  }
}

class RoomUser {
  constructor(playerName, ws, lobby) {
    this.id = uuidv4();
    this.playerName = playerName;
    this.ws = ws;
    this.lobby = lobby;

    ws.on('close', () => {
      this.lobby.removeUser(this.id);
    });

    ws.on('message', (raw) => {
      const data = messagePack.decode(raw);
      if (data[0] == 'start') {
        this.lobby.startGame();
      }
    });
  }
}

module.exports = {
  Room,
  RoomUser,
};
