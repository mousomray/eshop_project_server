const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const CartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, "Quantity cannot be less than 1"]
            }
        }
    ]
}, { timestamps: true });

const CartModel = mongoose.model('cart', CartSchema);

module.exports = CartModel;