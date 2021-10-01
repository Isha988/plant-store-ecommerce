const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password:{
        type: String
    },
    reviews:{
        type: Array
    }
});

module.exports = mongoose.model('user',userSchema);