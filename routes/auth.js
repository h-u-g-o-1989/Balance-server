const router = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Session = require("../models/Session.model");
const Day = require("../models/Day.model");

// Require necessary middlewares in order to control access to specific routes
const shouldNotBeLoggedIn = require("../middlewares/shouldNotBeLoggedIn");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.get("/session", (req, res) => {
  // we dont want to throw an error, and just maintain the user as null
  if (!req.headers.authorization) {
    return res.json(null);
  }

  // accessToken is being sent on every request in the headers
  const accessToken = req.headers.authorization;

  Session.findById(accessToken)
    .populate("user")
    .then((session) => {
      if (!session) {
        return res.status(404).json({ errorMessage: "Session does not exist" });
      }
      return res.status(200).json(session);
    });
});

router.post("/signup", shouldNotBeLoggedIn, (req, res) => {
  const { username, password, email } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }

  if (password.length < 8) {
    return res.status(400).json({
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }
  // Search the database for a user with the username submitted in the form
  User.findOne({ username }).then((found) => {
    // If the user is found, send the message username is taken
    if (found) {
      return res.status(400).json({ errorMessage: "Username already taken." });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          email,
          password: hashedPassword,
        });
      })
      .then((user) => {
        Session.create({
          user: user._id,
          createdAt: Date.now(),
        }).then((session) => {
          res.status(201).json({ user, accessToken: session._id });
        });
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).json({ errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).json({
            errorMessage:
              "Username need to be unique. The username you chose is already in use.",
          });
        }
        return res.status(500).json({ errorMessage: error.message });
      });
  });
});

router.post("/login", shouldNotBeLoggedIn, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res.status(400).json({
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({ username })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res.status(400).json({ errorMessage: "Wrong credentials." });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).json({ errorMessage: "Wrong credentials." });
        }
        Session.create({ user: user._id, createdAt: Date.now() }).then(
          (session) => {
            return res.json({ user, accessToken: session._id });
          }
        );
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.delete("/logout", isLoggedIn, (req, res) => {
  Session.findByIdAndDelete(req.headers.authorization)
    .then(() => {
      res.status(200).json({ message: "User was logged out" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ errorMessage: err.message });
    });
});

router.post("/upload", isLoggedIn, (req, res) => {
  // console.log("HEADERS", req);
  const { work, sleep, chores, leisure, selfCare, mood, day, month } = req.body;

  if (+work + +sleep + +chores + +leisure + +selfCare > 24) {
    return res
      .status(400)
      .json({ errorMessage: "Theres Not That Many Hours In The Day!" });
  }
  Day.create({
    work,
    sleep,
    chores,
    leisure,
    selfCare,
    mood,
    day,
    month,
    user: req.user._id,
  }).then((newDay) => {
    // console.log("new day post", newDay);
    res.json({ newDay });
  });
});

// Get the daily report (display)
router.get("/daily-report", isLoggedIn, (req, res) => {
  Day.find({ user: req.user._id }).then((allDays) => {
    res.json(allDays);
  });
});

// Single day get
router.get("/:id", (req, res) => {
  Day.findById(req.params.id)
    .then((singleDay) => {
      res.json(singleDay);
    })
    .catch((err) => console.log(err));
});

// Edit single day
router.put("/:id", isLoggedIn, (req, res) => {
  Day.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(
    (dayUpdated) => {
      res.json({ message: "okidok", dayUpdated });
    }
  );
});

// Delete single day
router.delete("/:id", isLoggedIn, (req, res) => {
  const { dayId } = req.params;
  console.log("dayId: ", dayId);
  Day.findByIdAndDelete(dayId, () => {
    console.log("Day deleted");
  }).then((deletedDay) => {
    console.log(deletedDay);
    res.redirect("/Daily-Report");
  });
});

// Missing some logic in services/auth ???

module.exports = router;
