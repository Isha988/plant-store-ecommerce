const express = require('express');
const router = express.Router();
const {userRouter, ensureAuthenticated} = require("./userAccount.js");
const adminRouter = require("./admin.js");
const bcrypt = require ('bcryptjs'); 
const { check,body, validationResult} = require('express-validator');
const passport = require('passport');

const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");

router.use("/user", userRouter); 
router.use("/admin", adminRouter); 
require('dotenv').config();
const GMAIL_USER = process.env.MAIL;
const GMAIL_PASS = process.env.PASSWORD;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//models
const plant = require('../models/plant');
const users = require('../models/user');
const carts = require('../models/cart');
const wishlists = require('../models/wishlist');
const orders = require("../models/order");
const comment = require("../models/comment");


//helpers
const hbs= require("hbs");
hbs.registerHelper("display",(option, value) =>{
   return option.categories.some(ele => ele == value);
  });

hbs.registerHelper( "when",function(operand_1, operator, operand_2) {
    var operators = {
     'eq': function(l,r) { return l == r; },
     'noteq': function(l,r) { return l != r; },
     'gt': function(l,r) { return Number(l) > Number(r); },
     'gteq': function(l,r) { return Number(l) >= Number(r); },
     'st': function(l,r) { return Number(l) < Number(r); },
     'steq': function(l,r) { return Number(l) <= Number(r); },
     'or': function(l,r) { return l || r; },
     'and': function(l,r) { return l && r; },
     '%': function(l,r) { return (l % r) === 0; }
    }
    , result = operators[operator](operand_1,operand_2);

    if (result) return result;
});

hbs.registerHelper( "cal",function(operand_1, operator, operand_2) {
    var operators = {
     'add': function(l,r) { return Number(l) + Number(r);},
     'sub': function(l,r) { return Number(l) - Number(r); },
     'div': function(l,r) { return Number(l) / Number(r); },
     'mul': function(l,r) { return Number(l) * Number(r); },
     'rDiv': function(l,r){ const ans = this.div(l,r)
        if(isNaN(ans)) { return Number(0)};
        return Math.round(ans);}
     
    }
    , result = operators[operator](operand_1,operand_2);
    return result;
});

hbs.registerHelper('for', function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i <= to; i += incr)
        accum += block.fn(i);
    return accum;
});


hbs.registerHelper('var' , function (variable, value) {
    variable = value
    return variable;
});

hbs.registerHelper('stringify' , function (array) {
    const string =  array.join();
    return string;
});

//static
//router.use('/:name', express.static('public'));
//router.use('/:name/:name', express.static('public'));

// authenticating function
// const ensureAuthenticated = (req, res, next) => {
//     if (req.isAuthenticated()) {
//       return next();
//     }
//     req.flash('alert', 'please login first')
//     res.redirect('/login');// if not auth
// }
function connectMailer(){
    return new Promise ( resolve => {
        const smtpTrans = nodemailer.createTransport({
            host: "smtp.gmail.com",
            secure: true,
            port: 465,
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS
            }
        });
    
        smtpTrans.verify(function (error, success) {
            if (error) {
                console.log("error occur");
                console.log(error);
            }
            else {
                resolve(smtpTrans);
            }
          });
    })
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

// small  cart
router.get('/cartSmall',(req, res) => {
    const user = req.user;
    if(user) {
        carts.findOne({user: user.id}).
        populate({path : 'items',
        populate: { path: 'plant' }}). 
        exec((err, cart)=> {
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
    carts.findOne({user: user.id}).
    populate({path : 'items',
    populate: { path: 'plant' }}). 
    exec((err, cart)=> {
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
router.get("/cart/:name", (req,res) =>{
    const query = {name : req.params.name};
    const unit = req.query.unit || 1;
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
                    plant : plant._id,
                    unit: unit,
                    total: plant.price
                }
                 
                carts.findOne({user: user.id}).populate({path : 'items',
                populate: { path: 'plant' }}). exec((err, cart) => {
                    if(err) {
                        console.log(err);
                    }
                    if (cart) {
                        let product = "";
                        cart.items.forEach(ele => {
                            if (ele.plant.name == plant.name){
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
                                        res.send('some error');
                                    }
                                    else {
                                        res.send('item added');
                                    }
                                } )
                        }
                    }
                    
                    else {
                        let newCart = new carts({
                            user: user._id,
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

//deleteing items from cart
router.delete("/cart/:id", (req,res) => {
    const id = req.params.id;
    const user = req.user.id;
    carts.findOneAndUpdate({user: user}, {$pull: {items : {plant : id}}}, (err) => {
        if(err) {
            res.send('some error occur please try again');
        }
        else {
            res.send('success');
        }
    })
})

// update cart 
router.post('/updateCart', (req, res) => {
    const user = req.user;
    const list = req.body;

    carts.findOne({user: user.id}).
    populate({path : 'items',
    populate: { path: 'plant' }}).
    exec((err, cart) => {
        let len = list.length;
        for(let i=0; i<len; i++ ) {
            cart.items[i].unit = list[i].unit || 1;
        }
        let newTotal = 0;
        let newTotalItem = 0;
        cart.items.forEach(ele => {
            ele.total = ele.plant.price * ele.unit;
            newTotal += ele.total;
            newTotalItem += ele.unit;
        })
        cart.total = newTotal;
        cart.totalItem = newTotalItem;
        cart.save((err) => {
            if(!err) {
                res.send(cart);
            }
        });
       
    })

    

} )
// checkout page
router.get('/checkout', ensureAuthenticated, (req, res) => {
    const user = req.user;
    carts.findOne({user: req.user.id}).
        populate({path : 'items', 
        populate: { path: 'plant' }}).
        exec((err, cart)=> {
        if(err) {
            console.log(err);
        }
        else {
            res.render('checkout', {
                title: "checkout",
                cart: cart
            });
        }
    })
});

//payment
router.post('/create-checkout-session', 
    check("bCountry", "country is required").trim().notEmpty().isAlpha(),
    check("bFirst", "first name is required").trim().notEmpty().isAlpha(),
    check("bAddress", "address is required").trim().notEmpty(),
    check("bCity", "city is required").trim().notEmpty().isAlpha(),
    check("bState", "State is required").trim().notEmpty().isAlpha(),
    check("bPin", "Pin is required").trim().notEmpty().isNumeric(),
    check("phone", "Phone is required").trim().notEmpty().isMobilePhone(),
    check("sCountry", "shipping country is required").if(body('shipCheckBox').exists()).trim().notEmpty().isAlpha(),
    check("sFirst", "shipping first name is required").if(body('shipCheckBox').exists()).trim().notEmpty().isAlpha(),
    check("sAddress", "shipping address is required").if(body('shipCheckBox').exists()).trim().notEmpty(),
    check("sCity", "shipping city is required").if(body('shipCheckBox').exists()).trim().notEmpty().isAlpha(),
    check("sState", "shipping State is required").if(body('shipCheckBox').exists()).trim().notEmpty().isAlpha(),
    check("sPin", "shipping Pin is required").if(body('shipCheckBox').exists()).trim().notEmpty().isNumeric(),
    check("sEmail", "shipping email is required").if(body('shipCheckBox').exists()).trim().notEmpty().isEmail(),
    check("sPhone", "shipping Phone is required").if(body('shipCheckBox').exists()).trim().notEmpty().isMobilePhone(),
    async (req, res) => {
    const errors = validationResult(req);
    const cart = await carts.findOne({user: req.user.id}).populate({path : 'items',
        populate: { path: 'plant' }});
    if (!errors.isEmpty()){
        res.render("checkout",{
            title : "checkout",
            user: req.user,
            errors: errors,
            cart: cart
        }
        )
    }
    else {
        let currency = "USD";
        let amountMultipler = 100;
        if(req.body.bCountry.match(/^india$/i)){
            currency = "INR";
            amountMultipler = 100*75.20
        }
        const list = cart.items.map((item)=>{
            return {
            
                price_data : {
                    currency: currency,
                    product_data: {
                        name: item.plant.name
                    },
                    unit_amount: item.plant.price*amountMultipler
                }, 
                quantity: item.unit
                } 
        })
    
        const session = await stripe.checkout.sessions.create({
                
        customer_email: req.user.email, 
        
        billing_address_collection: 'auto',
            
        line_items: await list,
    
        mode: 'payment',
    
        success_url: `${process.env.SERVER_URL}/checkoutSuccess`,
    
        cancel_url: `${process.env.SERVER_URL}/failure`,  
        });
    
    
        res.redirect(session.url);
    }
  
  });

  router.get("/checkoutSuccess", async(req, res)=> {
    try{
        const cart =  await carts.findOne({user: req.user.id});

        const newOrder = new orders({
            user: req.user.id,
            items: cart.items,
            totalItem : cart.totalItem,
            total : cart.total
        });

        await newOrder.save();

        cart.items =[];
        cart.totalItem =0;
        cart.total = 0;
        await cart.save();

        res.redirect("/thankYou");
    }catch(err){
        res.status(501).json(err.message);
    }
  })

  router.get("/thankYou", (req,res)=> {
      res.render("thankYou", {
          title : "Thank You"
      });
  })

  router.get("/failure", (req,res)=> {
    res.render("failure", {
        title : "failure"
    });
})

/// contact page
router.get('/contact', (req, res) => {
    res.render('contact',{title: 'contact'});
});

router.post(
    '/contact', 
    check("firstName", "name required").trim().notEmpty().isAlpha(),
    check("email", "not a valid email").trim().isEmail().normalizeEmail(),
    check("phone", "not avalid number").isMobilePhone(),
    check("message", "please write your message").trim().notEmpty(),
    async (req, res) => {
        const error = validationResult(req);
        if(!error.isEmpty()){
            res.render("contact", {
                title: 'contact',
                errors: error
            })
        }
        else {
            const smtpTrans = await connectMailer();
            const mailOpts = {
                from: req.body.firstName, 
                to: GMAIL_USER,
                subject: 'New message from contact form at plantza.com',
                text: `Name: ${req.body.firstName} ${req.body.lastName} \nEmail:(${req.body.email}) \nContact Number: ${req.body.phone} \nMessage: ${req.body.message}`
            }

            smtpTrans.sendMail(mailOpts, (error, response) => {
                if (error) {
                    req.flash('error', 'error in sending message please try again later;');
                    res.redirect('/contact');
                }
                else {
                    req.flash('success', 'your message is sent successfully');
                    res.redirect('/contact');
                }
            })
        }

})

// login page
router.get('/login', (req, res) => {
    if( req.isAuthenticated()){
        res.redirect("/user/account");
    }
    else {
        res.render('login register',{title: 'login'});
    }
});

// registration 
router.post(
    '/register',
    check('firstName', 'name only can contain aphabets').trim().notEmpty().isAlpha(),
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
    check('email', 'not a valid email').trim().isEmail(),
    check('email').custom(async value => {
        const user = await users.find({ email: value });
        if (user.length > 0) {
            throw new Error('email already in use');
        }
        return true;
    }),
    check('password', 'password must be of 8 to 15 digit with atleast one lowercase, uppercase, numeric digit').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols:0,
        maxLength: 15
    }),
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
            newUser.save(err => {
                if(err){
                    res.flash("error", "try again");
                    res.redirect('/login');
                }
                else{
                    req.flash('success', 'you are now registered');
                    passport.authenticate("local", {
                        failureRedirect: '/login',
                        failureFlash: true,
                        successFlash: true
                    })(req, res, function () {
                        res.redirect("/");
                    })
                }
                });
            });
        });
    }
    }
  );
//login form 

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: true
  }), (req, res) => {
    if ( req.body.remember ) {
      req.session.cookie.originalMaxAge = 30*24*60*60*1000 // Expires in 30 days
    } else {
      req.session.cookie.expires =false;
    }
    res.redirect('/')
  })

// logout
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});



// forget password mail 
router.post("/forgetPassword", (req, res) => {
    users.findOne({email: req.body.email}, async (err, user)=> {
        if(user){
            const smtpTrans = await connectMailer();
            const token = jwt.sign(
                { user_id: user._id},
                process.env.FORGOT_KEY,
                {
                  expiresIn: "1h",
                }
              );

            const mailOpts = {
                from: GMAIL_USER, 
                to: req.body.email,
                subject: 'Plantza Reset Password Link',
                html: `<html> <body>
                    <h1> Forgot your password?</h1>
                    <h1> No problem! </h1>
                    <p>You can set a new one now! </p>
                    <p>Click the link below</p>
                    <a href="${process.env.SERVER_URL}/resetPassword/${token}">Reset Password</a>
                    <p>This link will expire after 1 hour. If you need a new one,
                        you can request another on our
                        <a href="${process.env.SERVER_URL}/login">Log In Page </a>
                    </p>

                    </html> </body>`
            }

            smtpTrans.sendMail(mailOpts, (error, response) => {
                if (error) {
                    res.send("Error in sending mail. Try again ");
                }
                else {
                    user.resetToken = token;
                    user.save(err => {
                        if(err) {
                            res.send("error in updation");
                        }
                        else {
                            res.send("Email is sent successfully! please check your spam in case you get the mail");
                        }
                    })
                }
            })
            
        }else {
            res.send("no user found with this email id");
        }
    })
})

// reset password
router.get("/resetPassword/:token", (req, res )=> {
    const token = req.params.token;
    jwt.verify(token, process.env.FORGOT_KEY, (err, decoded)=> {
        if(err){
            res.redirect("/404");
        }
        else{
            users.findOne({_id: decoded.user_id, resetToken : token}, (err, user) => {
                if(user){
                    res.render("resetPassword", {
                        url : req.url
                    });
                }
                else {
                    res.redirect("/404");
                }
            })
        }
    });
    
})
router.post("/resetPassword/:token",  check('password', 'password must be of 8 to 15 digit with atleast one lowercase, uppercase, numeric digit').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    maxLength: 15
}),
check('confirmPassword').custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Password confirmation does not match password');
  }
   return true;
}), (req, res)=> {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('resetPassword', {
            title: 'login',
            errors: errors,
            url : req.url
        });
      }

    else {
        const token = req.params.token;
        jwt.verify(token, process.env.FORGOT_KEY, (err, decoded)=> {
            if(err){
                res.send("invalid link");
            }
            else{
                users.findOne({_id: decoded.user_id, resetToken : token}, (err, user) => {
                    if(user){
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                            user.password = hash;
                            user.resetToken = "";
                            user.save(err => {
                                if(err){
                                    res.flash("error", "try again");
                                    res.redirect(req.url);
                                }
                                else{
                                    req.flash('success', 'you password is change successfully');
                                    res.redirect('/login');
                                }
                                });
                            });
                            });
                    }
                    else {
                        res.redirect("/404")
                    }
                })
            }
        });
    }
})


// product page
router.get('/shop/product/:name' , (req, res) => {
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

const url = require('url');
const queryString = require('query-string');

hbs.registerHelper("urlStr", function(oldUrl, prop, val) {
    let queryobj = url.parse(oldUrl, true).query;
    if(prop == 'category'){
        queryobj ={
            category : val
        }
    }
    else if(prop == 'tags'){
       if('tags' in queryobj){
            let t =  Array(queryobj.tags);
            t.push(val);
            queryobj.tags = t;
       }
       else {
           queryobj.tags = [val];
       }
    }
    else {
        queryobj[prop] = val
    }

    let qs = queryString.stringify(queryobj);
    return qs;
});


// shop page
router.get('/shop', (req, res) => {
    const query = req.query;
    const filter = {};
        if(query.category){
            filter.categories = {$in : [query.category]};
        }

        if(query.tags){
            filter.tag = {$in : query.tags}
        }
        if(query.minprice || query.maxprice){
            filter.price = {
                $gte : query.minprice || 1,
                $lte : query.maxprice || 100
            }
        }
    
    const sort ={};
    if(query.sort){
        switch(query.sort){
            case "hp" :
                sort.price = -1;
                break; 
            case "lp" :
                sort.price = 1;
                break; 
            case "rate" :
                sort.stars = -1;
                break; 
            case "late" :
                sort.date = -1;
                break;
            case "pop" :
                sort.sale = -1;
                break;
            default: 
                break;
        }
    }   
      
    let limit = 5;
    let page = req.query.page || 1;
    plant
        .find(filter)
        .skip((limit * page) - limit)
        .limit(limit)
        .sort(sort)
        .exec(function(err, plants) {
            plant
                .find(filter).count().exec(function(err, count) {
                    if (err) return next(err);
                    res.render('shop', {
                        title: 'shop',
                        plant: plants,
                        current: page,
                        pages: Math.ceil(count / limit),
                        count: count,
                        url: req.url,
                        query: query
                    })
            })
        })
});

//search 
router.post("/search", async (req,res)=>{
    try{
        const search = req.body.search;
        const searchResult = await plant.find({
            name : {$regex: new RegExp(`\\b${search}`, "i") }
        });
        res.send(JSON.stringify(searchResult));
    }catch(err){
        console.log(err);
    }
})
    
// wishlist page
router.get('/wishlist', ensureAuthenticated, (req, res) => {
    const user = req.user;
    wishlists.findOne({user: user.id}).
    populate("items").
    exec( (err, wishlist) => {
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
                const newItem = plant._id;
                wishlists.findOne({user: user.id}).populate("items").exec((err, wishlist) => {
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
                            user: user._id,
                            items: [newItem]
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
//deleting items from wishlist
router.delete("/wishlist/:id", (req,res) => {
    const id = req.params.id;
    const user = req.user;
    wishlists.findOne({user: user.id}, (err, wishlist) => {
        wishlist.items.pull(id);
        wishlist.save( err => {
            if(err){
                res.send("some error occur , please try again later");
            }
            else{
                res.send("success");
            }
        });

    })
})
//fetch comment
router.get("/comment/:id", async(req, res) => {
    try{
        const comments = await comment.find({product : req.params.id}).sort({_id: -1}).populate("user", {firstName : 1, lastName:1, gender:1});
        let prevComment ;
        if(req.user){
            prevComment = await comment.findOne({product : req.params.id, user: req.user.id}).populate("user", {firstName : 1, lastName:1, gender:1});
        }
        res.send({
            comments : comments,
            prevComment : prevComment
        })
    }catch(error){
        res.status(500).json("error");
    }
})

// add comment 
router.post("/comment/:id", ensureAuthenticated, async(req,res)=> {
    const productId = req.params.id;
    const user = req.user;
    const product = await plant.findOne({id: productId});
    if(!product) {
       res.status(400);
       throw new Error("no product found");
    }
    const preComment = await comment.findOne({user: user.id, product : productId});
    if(preComment) {
        res.send({msg : "You have already reviewed this product"});
    }else{
    const newComment = new comment({
        user: user.id,
        product : productId,
        stars : req.body.stars,
        comment : req.body.comment
    });
    const addedComment = await newComment.save();
    const populatedcomment = await addedComment.populate("user", {firstName : 1, lastName:1, gender:1}); 
    const updatedProduct = await plant.findOneAndUpdate({_id: productId},{$inc : {totalStar : req.body.stars , totalReview: 1}}, {new:true} )

    res.send({
        comment: populatedcomment,
        review: updatedProduct.totalReview,
        star: updatedProduct.totalStar,
        msg: "comment added successfully"
    });}
})

// page not found
router.get('*', function(req, res){
    if(res.status(404)){
        res.render('error', {
            title: "Error 404"
        })
    }
  });

module.exports =  router;







