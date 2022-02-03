const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'user'
    },
    items:[{ 
        plant: {type: Schema.Types.ObjectId, ref: 'plant'}, 
        unit: Number, 
        total: Number}],
    totalItem: Number,            
    total: Number
});

module.exports = mongoose.model('cart',cartSchema);