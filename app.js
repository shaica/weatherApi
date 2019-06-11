//jshint esversion:6

require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const request = require("request");
const date = require(__dirname + "/date.js");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//////////////Database Stuff//////////////

mongoose.connect("mongodb://localhost:27017/accuAPI", {
  useNewUrlParser: true
});

mongoose.set("useCreateIndex", true);

const forecastSchema = new mongoose.Schema({
  callDate: Date,
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

const Istanbul = mongoose.model("Istanbul", forecastSchema);
const Ankara = mongoose.model("Ankara", forecastSchema);

/////Database Stuff -END-

app.route("/")
  .get(function(req, res) {

  res.render("home", {
    today: date.getDay(),
    time: date.getTime()
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
  const url = baseUrl + cityId + "?apikey=" + process.env.APIKEY + "&language=en-us&metric=true&details=true";
  request(url, function(err, response, body) {
    if (!err) {
      const data = JSON.parse(body);
      if (cityName === "istanbul") {
        data.forEach(function(dateTime) {
          const forecast12 = new Istanbul({
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
        apiSource: "Accuweather"
      });
    }
  });
});

app.route("/result")
  .get(function(req, res){
    res.render("result", {
      results: "Başarı!",
      apiSource: "Accu"
    });
  })
  .post(function(req,res){
    res.redirect("/");
  });

app.listen(4000, function() {
  console.log("Server started on port 4000.");
});
