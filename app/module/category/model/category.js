const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: "Category is required",
        minlength: [3, 'Category name must be at least 3 characters long']
    },
}, { timestamps: true });

const CategoryModel = mongoose.model('category', CategorySchema);

module.exports = CategoryModel; 