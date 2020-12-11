const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const daySchema = new Schema({
  work: {
    type: Number,
    default: 0,
    min: 0,
    max: 24,
  },
  sleep: {
    type: Number,
    default: 0,
    min: 0,
    max: 24,
  },
  chores: {
    type: Number,
    default: 0,
    min: 0,
    max: 24,
  },
  leisure: {
    type: Number,
    default: 0,
    min: 0,
    max: 24,
  },
  selfCare: {
    type: Number,
    default: 0,
    min: 0,
    max: 24,
  },
  mood: {
    type: String,
    required: true,
    enum: ["Angry", "Calm", "Excited", "Happy", "Sad", "Stressed", "Tired"],
  },
  month: {
    type: String,
    required: true,
  },
  day: {
    type: Number,
    min: 1,
    max: 31,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: `User`,
  },
});

const Day = model("Day", daySchema);

module.exports = Day;
