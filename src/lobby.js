const { v4: uuidv4 } = require('uuid');
const messagePack = require('messagepack');

class Lobby {
  constructor(roomID) {
    this.roomID = roomID;
    this.users = [];
  }

  addUser(user) {
    user.lobby = this;
    this.users.push(user);
    console.log(`${user.playerName} joined ${this.roomID}`);
    this.broadcastRoom();
  }

  removeUser(id) {
    const index = this.users.findIndex((val) => {
      if (val.id === id) return true;
      else return false;
    });
    this.users.splice(index, 1);
    this.broadcastRoom();
  }

  broadcastRoom() {
    var users = [];
    for (var i = 0; i < this.users.length; i++) {
      users.push(this.users[i].playerName);
    }
    var data = messagePack.encode(["room", users, true, true, false]);
    for (var i = 0; i < this.users.length; i++) {
      this.users[i].ws.send(data);
      if (i == 0)
        var data = messagePack.encode(["room", users, false, true, false]);
    }
  }
}

class LobbyUser {
  constructor(playerName, ws) {
    this.id = uuidv4();
    this.playerName = playerName;
    this.ws = ws;
    this.lobby = null;

    ws.on('close', () => {
      this.lobby.removeUser(this.id);
    });
  }
}

module.exports = {
  Lobby,
  LobbyUser,
};
