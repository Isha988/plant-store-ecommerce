const express = require('express');
const router = express.Router();

const bcrypt = require ('bcryptjs'); 
const { check, validationResult, body} = require('express-validator');
const users = require("../models/user");
const cart = require("../models/cart");
const wishlist = require("../models/wishlist");
const order = require("../models/order");
const user = require('../models/user');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); 
    }
    req.flash('error', 'please login first')
    res.redirect('/login');// if not auth
}

//account page
router.get("/account" , ensureAuthenticated, async (req, res)=> {
  try{
    const userCart = await cart.findOne({user: req.user.id}).populate({path : 'items',
    populate: { path: 'plant' }});

    const userOrders = await order.find({user: req.user.id}).sort({date : -1});

    const userWishlist = await wishlist.findOne({user: req.user.id}).populate("items");

    res.render('my account',{
      title: 'my account',
      tab: 'dashboard',
      cart : userCart,
      wishlist : userWishlist,
      order : userOrders
  });
  }
  catch(err){
      res.status(501).json(err.message);
  }
})


//profile changes
router.post(
  "/account",ensureAuthenticated,
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
  check("phoneNumber", "not a valid phone number").isMobilePhone(),
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
      if(user.phoneNumber != req.body.phoneNumber){
        user.phoneNumber = req.body.phoneNumber;
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

//address updation 
router.post(
  "/addressUpdate", ensureAuthenticated ,async (req, res) => {
    try{
      const user = req.user;
      const body = req.body;
      
      user.shippingAddress = {
        country: body.sCountry,
        state : body.sState,
        city : body.sCity,
        pin : body.sPin,
        address : body.sAddress
      };

      user.billingAddress = {
        country: body.bCountry,
        state : body.bState,
        city : body.bCity,
        pin : body.bPin,
        address : body.bAddress
      };
      await user.save();
      req.flash("success", "addresses updated successfully");
      res.redirect("/user/account");
    }
    catch(err){
      req.flash("error", "error in updating address! try again later");
      res.redirect("/user/account");
    }
  }
  
)

router.get("/order/:id", async(req,res)=>{
  try {
    const reqOrder = await order.findOne({user: req.user.id,
      id: req.params.id}).populate({path : 'items',
      populate: { path: 'plant' }});
      console.log(reqOrder);
    if(reqOrder){
      res.render("order", {
        title: "order",
        order : reqOrder
      })
    }else {
      res.render("error", {
        title: "error"
      })
    }
  }
  catch(err){
    console.log(err);
  }
})



module.exports = {userRouter : router, ensureAuthenticated: ensureAuthenticated};