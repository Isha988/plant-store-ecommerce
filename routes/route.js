const express = require('express');
const router = express.Router();
const bcrypt = require ('bcryptjs'); 
const { check, validationResult } = require('express-validator');
const passport = require('passport');

//models
const plant = require('../models/plant');
const users = require('../models/user');
const carts = require('../models/cart');
const wishlists = require('../models/wishlist');

//helpers
const hbs= require("hbs");
hbs.registerHelper("display",(option, value) =>{
   return option.categories.some(ele => ele == value);
  });

//static
router.use('/:name/:name', express.static('public'));

// authenticating function
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('alert', 'please login first')
    res.redirect('/login');// if not auth
}



//home page route
router.get('/', (req, res) => {
   plant.find({}, (err, plant) => {
    if(err){
        console.log(err);
    }
    else {
        res.render('home',{
            title: "Plant Store",
            plant: plant});
    }
   })
});

// about page
router.get('/about', (req, res) => {
    res.render('about',{title: 'about'});
});

// smal  cart
router.get('/cartSmall',(req, res) => {
    const user = req.user;
    if(user) {
        carts.findOne({user: user.id}, (err, cart)=> {
            if(err) {
                console.log(err);
            }
            else {
                res.send(cart);
            }
        })
    }
    else{
        res.send();
    }
});

// cart page
router.get('/cart', ensureAuthenticated, (req, res) => {
    const user = req.user;
    carts.findOne({user: user.id}, (err, cart)=> {
        if(err) {
            console.log(err);
        }
        else {
            res.render('cart', {
                title: "cart",
                cart: cart
            });
        }
    })
});

//add to cart
router.get("/cart/:name", (req,res,next) =>{
    const query = {name : req.params.name};
    const user = req.user;
    if(!user){
        res.send('please login');
    }
    else {
        plant.findOne(query, (err, plant) => {
            if (err){
                res.send(err);
            }
            if (plant == null){
                res.render('error', {
                    title: 'error 404'
                });
            }
            if(plant){
                const newItem = {
                    name: plant.name,
                    img: plant.src[0],
                    price: plant.price,
                    unit: 1,
                    total: plant.price
                }
                carts.findOne({user: user.id}, (err, cart) => {
                    if(err) {
                        console.log(err);
                    }
                    if (cart) {
                        let product = "";
                        cart.items.forEach(ele => {
                            if (ele.name == plant.name){
                                product = ele.name;
                            }
                        });
                        if(product !== "") {
                            res.send('item is already present in cart');
                        }
                        else{
                            carts.findOneAndUpdate({user: user.id},
                                {$push: {items: newItem}}, (err) => {
                                    if(err) {
                                        res.send('some error occur please try again');
                                    }
                                    else {
                                        res.send('item added');
                                    }
                                } )
                        }
                    }
                    
                    else {
                        let newCart = new carts({
                            user: user.id,
                            items: [newItem],
                            total: plant.price,
                        })
                        newCart.save((err) => {
                            if(err) {
                                res.send('some error occur please try again');
                            }
                            else {
                                res.send('item added');
                            }
                        });

                    }
                })

            }
        })
    }
           
       
    
});

// checkout page
router.get('/checkout', (req, res) => {
    res.render('checkout',{title: 'checkout'});
});

/// contact page
router.get('/contact', (req, res) => {
    res.render('contact',{title: 'contact'});
});

// login page
router.get('/login', (req, res) => {
    res.render('login register',{title: 'login'});
});

// registration 
router.post(
    '/register',
    check('firstName', 'name required').trim().notEmpty(),
    check('email', 'not a valid email').trim().isEmail(),
    check('email').custom(value => {
        return users.find({email : value}).then(user => {
          if (user.length > 0) {
            throw new Error('email already in use');
          }
          return true;
        });
    }),
    check('password', 'password must be of 8 to 15 digit').trim().isLength({ min: 8 , max:15}),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
       return true;
    }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('login register', {
            title: 'login',
            errors: errors
        });
      }
      
      else {
        let newUser = new users({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });
          
        bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save();
            });
        });
        req.flash('success', 'you are now registered');
        res.redirect('/');
    }
    }
  );
// login form 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true })(req, res, next);
});


router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

// my account page
router.get('/myaccount', ensureAuthenticated, (req, res) => {
    res.render('my account',{title: 'my account'});
});

// product page
router.get('/shop/:name' , (req, res) => {
    const name = req.params.name;
    plant.find({name: name}, (err, product) => {
       if(err){
           console.log(err);
       }
       else if (product.length < 1){
           res.render('error', {
               title: 'error 404'
           });
       }
       else {
        res.render('product' , {
            title: 'Product',
            product: product
        });
       }
    })
});



// shop page
router.get('/shop', (req, res) => {

    plant.find({}, (err, plant) => {
        if(err){
            console.log(err);
        }
        else {
            res.render('shop',{
                title: 'Shop' ,
                plant: plant});
        }
       }) 
});

// wishlist page
router.get('/wishlist', ensureAuthenticated, (req, res) => {
    const user = req.user;
    wishlists.findOne({user: user.id}, (err, wishlist)=> {
        if(err) {
            console.log(err);
        }
        else {
            res.render('wishlist', {
                title: "wishlist",
                wishlist: wishlist
            });
        }
    })
});

//add to wishlist
router.get("/wishlist/:name", (req,res) =>{
    const query = {name : req.params.name};
    const user = req.user;
    if(!user){
        res.send('please login');
    }
    else {
        plant.findOne(query, (err, plant) => {
            if (err){
                res.send(err);
            }
            if (plant == null){
                res.render('error', {
                    title: 'error 404'
                });
            }
            if(plant){
                const newItem = {
                    name: plant.name,
                    img: plant.src[0],
                    price: plant.price,
                }
                wishlists.findOne({user: user.id}, (err, wishlist) => {
                    if(err) {
                        console.log(err);
                    }
                    if (wishlist) {
                        let product = "";
                        wishlist.items.forEach(ele => {
                            if (ele.name == plant.name){
                                product = ele.name;
                            }
                        });
                        if(product !== "") {
                            res.send('item is already present wishlist');
                        }
                        else{
                            wishlists.findOneAndUpdate({user: user.id},
                                {$push: {items: newItem}}, (err) => {
                                    if(err) {
                                        res.send('some error occur please try again');
                                    }
                                    else {
                                        res.send('item added to wishlist');
                                    }
                                } )
                        }
                    }
                    
                    else {
                        let newWishlist = new wishlists({
                            user: user.id,
                            items: [newItem],
                            total: plant.price,
                        })
                        newWishlist.save((err) => {
                            if(err) {
                                res.send('some error occur please try again');
                            }
                            else {
                                res.send('item added to wishlist');
                            }
                        });

                    }
                })

            }
        })
    }
           
       
    
});


  
module.exports = router;







