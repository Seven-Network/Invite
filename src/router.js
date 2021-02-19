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

router.post('/update-map', (req, res) => {
  const room = global.rooms.find((val) => {
    if (val.roomID == req.params.roomID) return true;
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

module.exports = router;
