// import modules
const express = require("express");
const mongoose = require('mongoose');
const path = require("path");
const hbs = require('hbs');
const router = require('./routes/route');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require ('bcryptjs'); 
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');


const port = process.env.PORT || 3000;

//connecting mongoose
mongoose.connect('mongodb://localhost:27017/products');
const db = mongoose.connection;

db.once('open', ()=> {
    console.log('connected');
})

db.on('error', (error)=> {
    console.log(error);
})

//partial 
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

//starting app
const app = express();

//static file
app.use(express.static('public'))
app.use('/images', express.static(path.join(__dirname, 'public', 'images')))

// set view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cookieParser());
//session middle-ware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//body-parser
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//express message middle-ware
app.use(flash());
app.use((req, res, next)=>{
  app.locals.success = req.flash('success')
  next();
});
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function(username, password, done) {
    User.findOne({ email : username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'email not found' });
      }
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err){
          throw err;
        }
        if(isMatch){
          return done(null,user);
        }
        else {
          return done(null, false, {message: 'wrong password'});
        }
      })
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//passport middle ware

app.use(passport.initialize());
app.use(passport.session());

//is login
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//registering routes
app.use(router);

//app listening
app.listen(port, ()=> {
    console.log(`Example app listening at http://localhost:${port}`);
});






 
 
 