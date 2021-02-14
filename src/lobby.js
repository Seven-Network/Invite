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

module.exports = {
  Lobby,
  LobbyUser,
};
