const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = Schema({
    firstName: {
        type: String
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
    password:{
        type: String
    },
    billingAddress: {
        type: String
    },
    shippingAddress: {
        type: String
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