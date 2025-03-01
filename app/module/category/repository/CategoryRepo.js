const CategoryModel = require('../model/category');
const mongoose = require('mongoose');

class CategoryRepo {

    // Add category function
    async createCategory(categoryData) {
        return await CategoryModel.create(categoryData);
    }

    // All category function
    async allCategories() {
        return await CategoryModel.find();
    }

    // single category function 
    async oneCategory(id) {
        return await CategoryModel.findById(id);
    }

    // Update category 
    async updateCategory(id, categoryData) {
        return await CategoryModel.findByIdAndUpdate(id, categoryData)
    }

    // Delete category 
    async deleteCategory(id) {
        return await CategoryModel.findByIdAndDelete(id);
    }

    // Find by category name
    async findByName(name) {
        return await CategoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }

    // Category respective subcategory
    async catWiseSubcategory() {
        return CategoryModel.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'subcategories'
                }
            }
        ]);
    }

    // product count categories
    async pCountCat() {
        return CategoryModel.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "categorydetails"
                }
            },
            {
                $group: {
                    _id: {
                        categoryId: "$_id",
                        name: "$name"
                    },
                    totalproducts: { $sum: { $size: "$categorydetails" } }
                }
            }
        ])
    }
}

module.exports = new CategoryRepo(); 