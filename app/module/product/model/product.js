const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: "Title is required",
        minlength: [3, 'Title must be at least 3 characters']
    },
    description: {
        type: String,
        required: "Description is required",
        minlength: [10, 'Description must be at least 10 characters']
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        required: "BrandId is required",
        ref: 'brand'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: "CategoryId is required",
        ref: 'category'
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: "SubcategoryId is required",
        ref: 'subcategory'
    },
    price: {
        type: Number,
        required: "Price is Required"
    },
    image: {
        type: String,
        required: "Enter image it is Required"
    },
    active: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const ProductModel = mongoose.model('product', ProductSchema);

module.exports = ProductModel;