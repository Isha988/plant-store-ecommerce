const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'user'
    },
    product: {
        type: Schema.Types.ObjectId, ref: "product"
    },
    stars : {
        type: Number,
    },
    comment: {
        type: String,
    }
}, { timestamps: true });


module.exports = mongoose.model('comment',commentSchema);