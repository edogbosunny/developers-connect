const express = require("express");
const mongoose = require("mongoose");
const db = require("./config/keys");
const bodyParser = require("body-parser");
const passport = require("passport");

//init our routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();
//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//init passport middleware here
app.use(passport.initialize());
//passport cconfig
require("./config/passport.js")(passport);

mongoose
  .connect(
    db.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("connected to db"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  //console.log(res);
  res.send("hello");
});

//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
