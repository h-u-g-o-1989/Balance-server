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
    enum: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  day: {
    type: Number,
    required: true,
    enum: [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
    ],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: `User`,
  },
});

const Day = model("Day", daySchema);

module.exports = Day;
