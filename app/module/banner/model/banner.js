const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
    title: {
        type: String,
        required: "Title is required",
        minlength: [3, 'Title must be at least 3 characters long']
    },
    subtitle: {
        type: String,
        required: "Subtitle is required",
        minlength: [3, 'Subtitle must be at least 3 characters long']
    },
    image: {
        type: String,
        required: "Enter image it is Required"
    },
}, { timestamps: true });

const BannerModel = mongoose.model('banner', BannerSchema);

module.exports = BannerModel; 