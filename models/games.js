const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  name: String,
  description: String,
  type: String,
  minimumAge: Number,
  pricing: {
    hourly: String,
    perGame: String,
  },
  image: {
    description: String,
    path: String,
  }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
