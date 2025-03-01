const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        products: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
                title: String,
                price: Number,
                quantity: Number,
                totalPrice: Number
            }
        ],
        totalAmount: { type: Number, required: true },
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
            paymentmethod: { type: String, required: true, enum: ['CreditCard', 'DebitCard', 'PayPal', 'BankTransfer', 'Cash'] }
        },
        orderStatus: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("order", OrderSchema); 
