const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = Schema({
    firstName: {
        type: String
    },
    role: {
        type:String
    },
    lastName: {
        type: String
    },
    gender: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: Number
    },
    password:{
        type: String
    },
    billingAddress: {
        country: String,
        state: String,
        city: String,
        pin: String,
        address: String
    },
    shippingAddress: {
        country: String,
        state: String,
        city: String,
        pin: String,
        address: String
    },
    resetToken:{
        type: String
    },
    cart: { 
        type: Schema.Types.ObjectId, ref: 'cart'
    },
    wishlist: { 
        type: Schema.Types.ObjectId, ref: 'wishlist'
    },
    reviews:{
        type: Array
    }
});

module.exports = mongoose.model('user',userSchema);