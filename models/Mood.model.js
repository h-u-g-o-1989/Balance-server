const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const moodSchema = new Schema({
  mood: {
    type: String,
    required: true,
    enum: ["Angry", "Calm", "Excited", "Happy", "Sad", "Stressed", "Tired"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: `User`,
  },
});

const Mood = model("Mood", moodSchema);

module.exports = Mood;
