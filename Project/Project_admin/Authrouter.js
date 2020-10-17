var express = require("express");
var Authrouter = express.Router();

var db = require("../config/database");
var flash = require("express-flash");
var session = require("express-session");

Authrouter.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
Authrouter.use(flash());

//Authentications all TABs.
Authrouter.get("/pages-404", function (req, res) {
  res.render("Pages/pages_404");
});

Authrouter.get("/pages-500", function (req, res) {
  res.render("Pages/pages_500");
});
Authrouter.get("/pages-comingsoon", function (req, res) {
  res.render("Pages/pages_comingsoon");
});
Authrouter.get("/pages-lock-screen", function (req, res) {
  res.render("Pages/pages_lock_screen");
});
Authrouter.get("/pages-lock-screen-2", function (req, res) {
  res.render("Pages/pages_lock_screen_2");
});

Authrouter.get("/login", function (req, res) {
  console.log(req.flash("msg1"));
  res.render("Pages/pages_login", {
    msg1: req.flash("msg1"),
    msg2: req.flash("msg2"),
  });
});
Authrouter.get("/pages-login-2", function (req, res) {
  res.render("Pages/pages_login_2");
});
Authrouter.get("/pages-maintenance", function (req, res) {
  res.render("Pages/pages_maintenance");
});
Authrouter.get("/pages-recoverpw", function (req, res) {
  res.render("Pages/pages_recoverpw");
});
Authrouter.get("/pages-recoverpw-2", function (req, res) {
  res.render("Pages/pages_recoverpw_2");
});
Authrouter.get("/pages-register", function (req, res) {
  res.render("Pages/pages_register");
});
Authrouter.get("/pages-register-2", function (req, res) {
  res.render("Pages/pages_register_2");
});
Authrouter.get("/pages-comingsoon", function (req, res) {
  res.render("Pages/pages_comingsoon");
});

module.exports = Authrouter;
