const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubCategorySchema = Schema({
    subname: {
        type: String,
        require: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "category"
    },
})

const SubCategoryModel = mongoose.model("subcategory", SubCategorySchema)
module.exports = SubCategoryModel