const express = require('express');
const router = express.Router();
const passport = require("passport");
const multer = require('multer');

const plants = require("../models/plant.js");
const limit = 5; 
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role=="admin") {
      return next(); 
    }
    req.flash('error', 'please login first')
    res.redirect('/admin/login');// if not auth
}

router.get("/login", (req,res)=>{
    res.render("adminLogin", {
        title: "admin login"
    });
})
router.post("/login",
    passport.authenticate('adminLogin', {
        failureRedirect: '/admin/login',
        failureFlash: true
    }), (req, res) => {
        if ( req.body.remember ) {
        req.session.cookie.originalMaxAge = 30*24*60*60*1000 // Expires in 30 days
        } else {
        req.session.cookie.expires =false;
        }
        res.redirect('/admin/dashboard')}
)

router.get("/dashboard", ensureAuthenticated, async(req,res)=>{
    const plant = await plants.find().sort({_id : -1}).limit(limit)
    res.render("adminDashboard", {
        title: "admin dashboard",
        plant : plant
    });
})

router.get("/new", ensureAuthenticated, (req,res)=>{
    res.render("productForm", {
        title: "new product"
    });
})

router.get("/edit/:id", ensureAuthenticated, async(req,res)=>{
  try{
    const plant = await plants.findOne({_id: req.params.id});
    res.render("productForm", {
    title: "edit product",
    plant : plant 
    });
  }catch(err){
    res.status(500);
  }
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      var filename = file.fieldname + '-' + uniqueSuffix;
            switch (file.mimetype) {
              case 'image/png':
                filename = filename + ".png";
              break;
              case 'image/jpeg':
                filename = filename + ".jpeg";
              break;
              case 'image/webp':
                filename = filename + ".webp";
              break;
              case 'image/jpg':
                filename = filename + ".jpg"
              break;
              default:
              break;
            }
            cb(null, filename);
        
    }
  })
const upload = multer({ storage: storage })

router.post("/new", upload.array("image", 7), async(req,res)=>{
   try{
    const product = new plants(req.body);
    const src=[], information=[];
    req.files.forEach(file => {
        src.push(`images/${file.filename}`);
    });
    product.information.forEach(info => {
      information.push(JSON.parse(info));
    });
    product.information = information;
    product.src = src;
    await product.save();
    res.send("product added successfully");
   }catch(err){
      res.status("500").json("error");   
    }
    
})

router.post("/edit/:id", upload.array("image", 7), async(req,res)=>{
  try{
    const updates = req.body;
    const product = await plants.findOne({_id : req.params.id});
    const src=[], information=[];
    req.files.forEach(file => {
       src.push(`images/${file.filename}`);
    });
    updates.information.forEach(info => {
     information.push(JSON.parse(info));
    });
    product.information = information;
    product.name = updates.name;
    product.price = updates.price;
    product.categories = updates.categories;
    product.tag = updates.tag;
    product.shortDesc = updates.shortDesc;
    product.longDesc = updates.longDesc;

    const updatedSrc = product.src.concat(src);
    product.src = updatedSrc;
    await product.save();
    res.send("product updated successfully");
  }catch(err){
    res.status("500").json("error");   
   }
   
})

// delete product 
router.delete("/delete", async(req, res)=>{
  try{
    await plants.deleteOne({_id: req.body.id});
    res.send("product deleted successfully");
  }catch(err){
    res.status(500).json("error in deleting");
  }
})

router.post("/showMore", async(req,res)=>{
  try{
    const skip = req.body.count;
    const plant = await plants.find().sort({_id : -1}).skip(skip).limit(limit);
    res.send(plant);
  }catch(err){
    res.status(500).json("some error occur");
  }
})

module.exports = router;