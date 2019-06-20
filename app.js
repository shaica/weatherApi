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

///Cookies and stuff
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());
///Cookies and stuff -END-

// TODO: Add Authentication
// TODO: Add pull data as csv file
// FIXME: Fix env variables in heroku APP
//////////////Database Stuff//////////////

//const mongodbUrl = "mongodb+srv://admin-ezgi:" + process.env.ADMIN_EZGI + "@cluster0-l9wx7.mongodb.net/weatherAPI"; // NOTE: Uncomment before going live
// TODO: Mongodb Connect via env variable
// TODO: Mongodb connect via user login info
// mongoose.connect(mongodbUrl, {
//   useNewUrlParser: true,
//   useFindAndModify: false
// }); // NOTE: Uncomment before going live

mongoose.connect("mongodb://localhost:27107/accuAPI", {useNewUrlParser: true}); // NOTE: comment before going live
mongoose.set("useCreateIndex", true);


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

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
//mongoose models
const User = mongoose.model("User", userSchema);
const Istanbul = mongoose.model("Istanbul", forecastSchema);
const Ankara = mongoose.model("Ankara", forecastSchema);

/////Database Stuff -END-
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.route("/login")
  .get(function(req, res){
    res.render("login");
  })
  .post(function(req, res){
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/");
        });
      }
    });
  });

app.route("/")
  .get(function(req, res) {

    res.render("home", {
      today: date.getDay(),
      time: date.getTime()// FIXME: GMT +3 doesn't show
    });
  })

  .post(function(req, res) {
    const baseUrl = "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/";
    const cityName = _.lowerCase(req.body.cityName);
    switch (cityName) {
      case "ankara":
        cityId = 316938;
        break;

      case "istanbul":
        cityId = 318251;
        break;

      default:
        res.render("result", {
          results: "Hımmm."
        });
    }
    const url = baseUrl + cityId + "?apikey=" + process.env.ACCUWEATHER_APIKEY + "&language=en-us&metric=true&details=true";
    request(url, function(err, response, body) {
      if (!err) {
        const data = JSON.parse(body);
        if (cityName === "istanbul") {
          data.forEach(function(dateTime) {
            const forecast12 = new Istanbul({
              dataBase: "Accuweather", //TODO: Add new apiSources and update collection model
              callDate: new Date(),
              cityId: req.body.cityName,
              dateTime: dateTime.DateTime,
              hasPrecipitation: dateTime.HasPrecipitation,
              precipitationProbability: dateTime.PrecipitationProbability,
              temperatureValue: dateTime.Temperature.Value,
              temperatureUnit: dateTime.Temperature.Unit,
              windSpeed: dateTime.Wind.Speed.Value,
              windDirection: dateTime.Wind.Direction.Degrees,
              relativeHumidty: dateTime.RelativeHumidity,
              rainProbability: dateTime.RainProbability,
              snowProbability: dateTime.SnowProbability,
              uvIndex: dateTime.UVIndex,
              rainValue: dateTime.Rain.Value,
              snowValue: dateTime.Snow.Value,
            });
            forecast12.save();
          });
        } else if (cityName === "ankara") {
          data.forEach(function(dateTime) {
            const forecast12 = new Ankara({
              dataBase: "Accuweather", //TODO: Add new apiSources and update collection model
              callDate: new Date(),
              cityId: req.body.cityName,
              dateTime: dateTime.DateTime,
              hasPrecipitation: dateTime.HasPrecipitation,
              precipitationProbability: dateTime.PrecipitationProbability,
              temperatureValue: dateTime.Temperature.Value,
              temperatureUnit: dateTime.Temperature.Unit,
              windSpeed: dateTime.Wind.Speed.Value,
              windDirection: dateTime.Wind.Direction.Degrees,
              relativeHumidty: dateTime.RelativeHumidity,
              rainProbability: dateTime.RainProbability,
              snowProbability: dateTime.SnowProbability,
              uvIndex: dateTime.UVIndex,
              rainValue: dateTime.Rain.Value,
              snowValue: dateTime.Snow.Value,
            });
            forecast12.save();
          });
        }
        res.render("result", {
          results: "Başarı!",
          apiSource: "Accuweather" // TODO: call from variable apiSource
        });
      }
    });
  });

app.route("/result")
  .get(function(req, res) { // NOTE: For test purposes only
    res.render("result", {
      results: "Başarı!",
      apiSource: "Accu" // TODO: call from variable apiSource
    });
  })
  .post(function(req, res) {
    res.redirect("/");
  });

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }


  app.listen(port, function() {
    console.log("Server has started succesfully");
  });
