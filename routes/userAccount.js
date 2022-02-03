const express = require('express');
const router = express.Router();

const bcrypt = require ('bcryptjs'); 
const { check, validationResult} = require('express-validator');
const users = require("../models/user");

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'please login first')
    res.redirect('/login');// if not auth
}

//account page
router.get("/account" , ensureAuthenticated, (req, res)=> {
    res.render('my account',{
      title: 'my account',
      tab: 'dashboard'
  });
})


//profile changes
router.post(
  "/update",
  check('firstName', 'name required and can only contain alphabets').trim().notEmpty().isAlpha(),
  check('lastName', "last name can only contain alphabets").
    custom ( value => {
      if(!value) {
        return true;
      }
      value = value.trim();
      let letters = /^[A-Za-z]+$/;
      if(value.match(letters)){
        return true;
      }
    }),
  check('email', 'not a valid email').trim().notEmpty().isEmail().
    custom(async (value, {req}) => {
    const user = await users.findOne({ email: value })
      if (user && user.id != req.user.id) {
        throw new Error('email already in use');
      }
      return true;
  }),
  check("gender", "Please enter male or female").custom(gender => {
    if(!gender) return true;
    if(gender.match(/^male$/i) || gender.match(/^female$/i)) return true;
  }),
  check('password').custom(async (password, {req}) => {
      if (!password) return true;

      const match = await bcrypt.compare(password, req.user.password);
      if (match) return true;
       throw new Error("current password don't match");
  }),
  check('newPassword', 'password must be of 8 to 15 digit with atleast one lowercase, uppercase, numeric digit').
    custom((newPassword, {req}) => {
      if(!newPassword) return true;
      const length = newPassword.length;
      const capital = newPassword.match( /[A-Z]/g);
      const small = newPassword.match( /[a-z]/g);
      const number = newPassword.match(/[0-9]/g);

      if(!req.body.password) throw new Error("enter your current password");

      if(length >= 8 && length<=15 && capital && small && number ) return true;
      
    }),      
  check('confirmNewPassword').custom((value, {req}) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
  }), async (req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     res.render("my account", {
       title: "my account",
       errors: errors,
       tab: "account details",
       user: req.user
     })
    }else {
      const user = req.user;
      if(user.firstName != req.body.firstName.trim()){
        user.firstName = req.body.firstName.trim();
      }
      if(user.lastName != req.body.lastName.trim()){
        user.lastName = req.body.lastName.trim();
      }
      if(user.email != req.body.email){
        user.email = req.body.email;
      }
      if(user.gender != req.body.gender){
        user.gender = req.body.gender || "";
      }
      if(req.body.password && req.body.newPassword){
          bcrypt.genSalt(10, function(_err, salt) {
          bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
            if(err) {
              req.flash("error", "error occur! try again later");
              res.status(500).redirect("/user/account");
            }
            else {
              user.password = hash;
              user.save(err => {
                if(err){
                  req.flash("error", "error occur! try again later");
                  res.status(500).redirect("/user/account");
                }
                else {
                  req.flash("success", "changes are made successfully");
                  res.redirect("/user/account");
                }
              });
            }
          })
        })
      }
      else {
        user.save(err => {
          if(err){
            req.flash("error", "error occur! try again later");
            res.status(500).redirect("/user/account");
          }
          else {
            req.flash("success", "changes are made successfully");
            res.redirect("/user/account");
          }
        });
      }
    }
    
  }
 
);



module.exports = {userRouter : router, ensureAuthenticated: ensureAuthenticated};