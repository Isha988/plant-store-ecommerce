const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'user'
    },
    items:[{ 
        plant: {type: Schema.Types.ObjectId, ref: 'plant'}, 
        unit: Number, 
        total: Number}],
    totalItem: Number,            
    total: Number,
    date: {
        type: Date,
        default : new Date()
    }
});

module.exports = mongoose.model('order',orderSchema);