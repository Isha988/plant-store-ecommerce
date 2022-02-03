const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'user'
    },
    items: [{ 
        type: Schema.Types.ObjectId, ref: 'plant'
    }]
});

module.exports = mongoose.model('wishlist',wishlistSchema);