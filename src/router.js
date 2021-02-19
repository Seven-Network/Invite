const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const router = require('express').Router();

const { Room } = require('./room');

router.get('/', (_, res) => {
  res.send('Welcome to the Seven Network invite server ✨');
});

router.post('/create-room', (_, res) => {
  const newRoom = new Room(uuidv4(), 'NA');
  global.rooms.push(newRoom);
  res.json({
    success: true,
    result: `https://venge.io/#${newRoom.roomID}`,
  });
});

router.post('/update-map/:map', (req, res) => {
  const room = global.rooms.find((val) => {
    if (val.roomID == req.query.roomID) return true;
  });
  if (room) {
    room.map = req.params.map;
    res.json({
      success: true,
    });
  } else {
    res.json({
      success: false,
      message: 'Room does not exist',
    });
  }
});

router.post('/get-room/:roomID', async (req, res) => {
  // TODO: Iterate over keys
  // Since there's only NA, this will suffice
  for (var i = 0; i < global.serverList['NA'].length; i++) {
    const response = await axios.get(
      `https://${global.serverList['NA'][i]}/get-game/${req.params.roomID}/${process.env.SERVER_LINK_PASS}`
    );
    if (response.status == 200) {
      res.json({
        success: true,
        is_owner: false,
        options: [],
        result: {
          connected_players: 0,
          country: 'NA',
          created_at: 0,
          for_invite: 1,
          hash: req.params.roomID,
          ip: global.serverList['NA'][i],
          is_mobile: 0,
          is_private: 1,
          level: 0,
          looking_for_players: 0,
          map: response.data.map,
          max_player: 6,
          server: global.serverList['NA'][i],
          server_code: '1.0.0',
          updated_at: 0,
        },
      });
      return;
    }
  }
  res.json({
    success: false,
    message: 'Could not find room',
  });
});

module.exports = router;
