//jshint esversion:6

require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const request = require("request");
const mongoose = require("mongoose");
const csv = require("express-csv");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); //passport-local is required by this package so we don't need to re-require it.

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//Cookies and Sessions
//setting up the session
app.use(session({
  store: new FileStore(),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
//initialize and start using passport
app.use(passport.initialize());
//to use passport to set up and manage session
app.use(passport.session());


//Database stuff
//connect to db
mongoose.connect("mongodb://localhost:27017/accuAPI", {
  useNewUrlParser: true,
  useCreateIndex: true
});
//NOTE: Uncomment before heroku
//const mongodbUrl = "mongodb+srv://admin-ezgi:" + process.env.ADMIN_EZGI + "@cluster0-l9wx7.mongodb.net/weatherAPI";
//mongoose.connect(mongodbUrl, {
//   useNewUrlParser: true,
//   useFindAndModify: false,
//   useCreateIndex: true
// });

//mongoose schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const forecastSchema = new mongoose.Schema({
  dataBase: String,
  callDate: Date, // FIXME: GMT +3 doesn't show
  cityId: String,
  dateTime: Date,
  hasPrecipitation: Boolean,
  precipitationProbability: Number,
  temperatureValue: Number,
  temperatureUnit: String,
  windSpeed: Number,
  windDirection: Number,
  relativeHumidty: Number,
  rainProbability: Number,
  snowProbability: Number,
  uvIndex: Number,
  rainValue: Number,
  snowValue: Number,
});

//mongoose plugins
userSchema.plugin(passportLocalMongoose); //to hash and salt passwords

//mongoose models

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy()); //the local strategy for authenticating users using username and password, and also to serialize and deserialize a user.

//serilize and deserializeUser only neccesary when using sessions. serializeUser creates the cookie for authentication and deserializeUser uses the information in the Cookie
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Istanbul = mongoose.model("Istanbul", forecastSchema);

const Ankara = mongoose.model("Ankara", forecastSchema);


//Authentication Routes
app.route("/register")
  .get(function(req, res) {
    const route = "register";
    res.render("register", {
      route: route
    });
  })
  .post(function(req, res) {
    User.register({
      username: req.body.username
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function() { //this callback function is only triggered if the authentication is successful and a cookie with current login session is created.
          res.redirect("/"); //because there is a authentication process we can use the route instead of rendering the ejs. And set up the route so that it can be only viewed iff the authentication session is still available.
        });
      }
    }); //this method comes from passportLocalMongoose -create and save a user
  });

app.route("/login")
  .get(function(req, res) {
    const route = "login";
    res.render("login", {
      route: route
    });
  })
  .post(function(req, res) {
    const user = User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err) { //login method comes from passport
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/");
        });
      }
    });
  });

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});


//Authenticated Routes
app.route("/")
  .get(function(req, res) {
    const route = "home";
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const dateObject = new Date();
    const today = days[dateObject.getDay()];
    const date = dateObject.getDate().toString() + " " + months[dateObject.getMonth()] + " " + dateObject.getFullYear().toString();
    const time = dateObject.toTimeString("tr");

    if (req.isAuthenticated()) {
      res.render("home", {
        route: route,
        username: req.user.username,
        date: date,
        today: today,
        time: time
      });
    } else {
      //the user is not authenticated (not logged in)
      res.redirect("/login");
    }
  })

  .post(function(req, res) {
    const apiSource = _.capitalize(req.body.apiSource);
    const cityName = _.lowerCase(req.body.cityName);
    if (cityName === "ankara")
    switch (cityName) {
      case "ankara":
        cityId = 316938;
        break;
      case "istanbul":
        cityId = 318251;
        break;
      default:
        res.render("result", {
          route: "result",
          results: "Hımmm."
        });
    }
    //TODO: home post route

  });


app.route("/download")
  .get(function(req, res) {
    const route = "download";
    if (req.isAuthenticated()) {
      res.render("download", {
        route: route
      });
    } else {
      res.redirect("/login");
    }
  })

  .post(function(req, res) {
    //TODO: download post route
  });


app.post("/result", function(req, res) {
  res.redirect("/");
});

//listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
app.listen(port, function() {
  console.log("Server started on port " + port + ".");
});
