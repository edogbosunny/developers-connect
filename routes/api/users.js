const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys").secretOrKey;
const passport = require("passport");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//load user model
const User = require("../../models/User");

//@route GET api/users/test
//@desc  test user rooute
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "users works" });
});

//@route GET api/users/register
//@desc  Register user
//@access public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //check for validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      errors.email = "Email already exist";
      return res.status(400).json({ errors });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //shoows the default avatar
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) console.log(err);
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route GET api/users/login
//@desc  Login user / returns jwt
//@access public

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
    email
  }).then(user => {
    if (!user) {
      errors.email = "Email does not exist";
      return res.status(404).json({ errors });
    }
    //we need to compare the hash
    //password with the password entered
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //res.json({ messaage: "success" });
        //User matched sign token
        //create jwt payload first

        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        //now wwe create token
        jwt.sign(payload, keys, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
            // payload:payload
          });
        });
      } else {
        errors.password = "Password Incorrect";
        return res.status(400).json({ errors });
      }
    });
  });
});

//@route GET api/users/current
//@desc  current  user
//@access privatae

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // res.json({ msg: "success" });
    // res.send(req.user);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
