const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./Models/user.model");
require("dotenv").config();

// CONNECT TO MONGODB
mongoose.connect(
  "mongodb+srv://alef:hello123@cluster0-2yq8x.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  },
  err => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);

let port=5000;
app.listen(port, () => {
  console.log("start listening on port 5000");
});

app.use((req, res, next) => {
  res.set("ACCESS-CONTROL-ALLOW-ORIGIN", "*");
  res.set("ACCESS-CONTROL-ALLOW-HEADERS", "*");
  res.set("ACCESS-CONTROL-ALLOW-METHODS", "*");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/sign-up", (req, res) => {
  let newUser = req.body.username;
  let pwd = bcrypt.hashSync(req.body.password, 10);

  User.findOne({ username: newUser })
    .then(user => {
      if (!user) {
        User.create({
          username: newUser,
          password: pwd
        }).then(userNew => {
          return res.send(userNew);
        });
      }
      // user already exists!
      else {
        res.status(400).send({
          error: "username already exists"
        });
      }
    })
    .catch(err => next(err));
});

app.post('/info', (req,res)=>{
    
    User.findOne({ username: req.body.username })
      .then(user => {
        user.tdee = req.body.tdee;
        user.goalCal = req.body.goal;
        user.diet = req.body.diet;
        user.proteinDL = req.body.protein;
        user.carbsDL = req.body.carbs;
        user.fatDL = req.body.fat;
        user.sugarDL = req.body.sugar;
        user.caffDL = 400;
        user.save();
        res.json("info saved");
      })
      .catch(err => res.status(400).json("Error: " + err));
})

app.post("/set-plan", (req, res) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      user.dailyPlan=req.body.dailyPlan;
      user.sport=req.body.sport;
      user.save();
      res.json("plan saved");
    })
    .catch(err => res.status(400).json("Error: " + err));
});

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      // user with this email not found? => error
      if (!user) {
        res.status(400).send({ err: "invalid username or password" });
      } else {
        // compare passwords using bcrypt.compare() function
        bcrypt.compare(req.body.password, user.password).then(success => {
          // user password does not match password from login form? => error
          if (!success) {
            res.status(400).send({ err: "invalid username or password" });
          } else {
            // create JWT token by signing
            // let secret = 'secret';
            // let token = jwt.sign(
            //   { username: user.username, aud: "iPhone-App" },
            //   secret
            // );

            // ,{ expiresIn: "1h" }

            // return token
            res.send({ token: user.username }); // => same as: { "token": token }
          }
        });
      }
    })
    .catch(err => res.status(400).json("err: " + err));
});

app.post("/home", (req, res) => {
  User.findOne({username: req.body.username})
    .then(userFound => {
      if (!userFound) {
        res.send({ err: "user not found" });
      } else {
        res.send({ found: userFound });
      }
    })
    .catch(err => res.status(400).json("err: " + err));
});

app.post("/reset", (req, res) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      user.udi = {
        date: req.body.date,
        calCount: 0,
        proteinCount: 0,
        fatCount: 0,
        carbsCount: 0,
        waterCount: 0,
        caffCount: 0,
        sugarCount: 0
      };
      user.save();
      res.json("udi reset Succeeded");
    })
    .catch(err => res.status(400).json("Error: " + err));

});

app.post("/add", (req, res) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      if (!user) {
        res.send({ err: "user not found" });
      } else {
        user.udi = req.body.udi;
        user.save();
        res.json("udi updated");
      }
    })
    .catch(err => res.status(400).json("err: " + err));
});