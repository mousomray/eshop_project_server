const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    name: {
        type: String,
        required: "Brand name is required",
    },
}, { timestamps: true });

const BrandModel = mongoose.model('brand', BrandSchema);

module.exports = BrandModel; 