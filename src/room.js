const { v4: uuidv4 } = require('uuid');
const messagePack = require('messagepack');
const axios = require('axios').default;

class Room {
  constructor(roomID, region) {
    this.roomID = roomID;
    this.map = 'Sierra';
    this.region = region;
    this.isPublic = false;
    this.users = [];

    this.serverHost = global.serverList[this.region][0];
  }

  addUser(playerName, ws) {
    const user = new RoomUser(playerName, ws, this);
    this.users.push(user);
    console.log(`${user.playerName} joined ${this.roomID}`);
    this.broadcastRoom();

    // If there is more than one player in a public lobby,
    // start the game.
    if (this.isPublic && this.users.length > 1) {
      this.startGame();
    }
  }

  removeUser(id) {
    const index = this.users.findIndex((val) => {
      if (val.id === id) return true;
      else return false;
    });
    console.log(`${this.users[index].playerName} left ${this.roomID}`);
    this.users.splice(index, 1);
    this.broadcastRoom();
    if (this.users.length < 1) {
      const index = global.rooms.findIndex((val) => {
        if (val.roomID == this.roomID) return true;
      });
      if (index > -1) {
        global.rooms.splice(index, 1);
      }
    }
  }

  broadcastRoom() {
    var users = [];
    for (var i = 0; i < this.users.length; i++) {
      users.push(this.users[i].playerName);
    }

    var data = messagePack.encode(['room', users, true, true, false]);

    for (var i = 0; i < this.users.length; i++) {
      this.users[i].ws.send(data);

      if (i == 0 && !this.isPublic) {
        // Have the first person of the room be the owner
        // if it is a private game.
        var data = messagePack.encode(['room', users, false, true, false]);
      }

      if (this.isPublic)
        this.users[i].ws.send(messagePack.encode(['matchmaking']));
    }
  }

  startGame() {
    // Create game server
    axios
      .get(
        `http://${this.serverHost}/create-game/${this.roomID}/${this.map}/${process.env.SERVER_LINK_PASS}`
      )
      .then((_) => {
        var data = messagePack.encode(['start']);
        for (var i = 0; i < this.users.length; i++) {
          this.users[i].ws.send(data);
        }
      })
      .catch((_) => {
        // If the request to create game fails
        // we can check whether it failed because
        // the game already exists.
        if (this.isPublic) {
          axios
            .get(
              `http://${this.serverHost}/get-game/${this.roomID}/${process.env.SERVER_LINK_PASS}`
            )
            .then((_) => {
              // In the case where the game exists,
              // just ask users to join the game.
              var data = messagePack.encode(['start']);
              for (var i = 0; i < this.users.length; i++) {
                this.users[i].ws.send(data);
              }
            })
            .catch((_) => {
              if (this.isPublic) {
                // just go lol, idgaf
                var data = messagePack.encode(['start']);
                for (var i = 0; i < this.users.length; i++) {
                  this.users[i].ws.send(data);
                }
              }
            });
        }
      });
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
      try {
        const data = messagePack.decode(raw);
        if (data[0] == 'start') {
          this.lobby.startGame();
        }
      } catch (_) {}
    });
  }
}

module.exports = {
  Room,
  RoomUser,
};
