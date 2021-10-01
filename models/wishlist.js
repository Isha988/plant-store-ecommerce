const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    user: String,
    items: [{name: String, img: String, price: Number}]
});

module.exports = mongoose.model('wishlist',wishlistSchema);