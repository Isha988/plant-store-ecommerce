const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    user: String,
    items: [{name: String, img: String, price: Number, unit: Number, 
            total: Number}],
    total: Number
});

module.exports = mongoose.model('cart',cartSchema);