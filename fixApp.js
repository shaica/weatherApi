//jshint esversion:6

require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const request = require("request");
const date = require(__dirname + "/date.js");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findOrCreate");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//Cookies and Sessions
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
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
//   useFindAndModify: false
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

//mongoose models

const User = mongoose.model("User", userSchema);

const Istanbul = mongoose.model("Istanbul", forecastSchema);

const Ankara = mongoose.model("Ankara", forecastSchema);

//mongoose plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//passport-local-mongoose serializeuser
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passport-native serialize user
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

//Routes
app.route("/login")
  .get(function(req, res){
    res.render("login");
  })

  .post(function(req, res){
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: "Geçersiz şifre veya kullanıcı adı.",
      successFlash: "Hoşgeldiniz."
    });
  });


app.route("/")
  .get(function(req, res){
    if (req.isAuthenticated()) {
      res.render("home", {
        today: date.getDay(),
        time: date.getTime()// FIXME: GMT +3 doesn't show
      });
    } else {
      res.redirect("/login");
    }
  });
//listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
app.listen(port, function(){
  console.log("Server started on port " + port + ".");
});
