//jshint esversion:6

require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
//const bcrypt = require("bcrypt"); //hashing and salting password - unneccsary when passport authentication

const app = express();
//const saltRounds = 10; //bcrypt - unneccsary when passport authentication

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//Cookies and Sessions


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





//Routes
app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {

  });

app.route("/login")
  .get(function(req, res) {
    res.render("login");
  })
  .post(function(req, res) {

  });



//listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
app.listen(port, function() {
  console.log("Server started on port " + port + ".");
});
