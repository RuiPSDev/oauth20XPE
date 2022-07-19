const express = require("express"),
  passport = require("passport"),
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  bodyParser = require("body-parser"),
  config = require("./configuration/config"),
  configFacebook = require("./configuration/configFacebook"),
  app = express();
require("dotenv").config();

var GoogleStrategy = require("passport-google-oauth20").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
const PORT = 3000;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_GG,
      clientSecret: process.env.CLIENT_SECRET_GG,
      callbackURL: process.env.CALLBACK_URL_GG,
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB,
      clientSecret: process.env.CLIENT_SECRET_FB,
      callbackURL: process.env.CALLBACK_URL_FB,
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
      /*  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      }); */
    }
  )
);

// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));

// ********** Entra no root e chama o template EJS **********
app.get("/", function (req, res) {
  res.render("index", { user: req.user });
});

// **********  oAuth2.0 com Google **********

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/logout",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

// **********  oAuth2.0 com Facebook **********

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook", { failureRedirect: "/logout" }),
  function (req, res) {
    res.redirect("/");
  }
);

// **********  logout  **********

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Server up at: http://localhost:${PORT}`));
