const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    src: {
        type: Array
    },
    name: {
        type: String
    },
    price: {
        type: Number
    },
    shortDesc: {
        type: String
    },
    categories: {
        type: Array
    },
    tag: {
        type: Array
    },
    information: {
        type: Array,
        Element : {
            type: Object,
            name: {
                type: String
            },
            info: {
                type: String
            }
        }
    },
    longDesc: {
        type: String
    },
    totalStar: {
        type: Number,
        default: 0
    },
    totalReview:{
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('plant',productSchema);