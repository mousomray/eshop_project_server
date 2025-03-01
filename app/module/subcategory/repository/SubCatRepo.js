const SubCategoryModel = require('../model/subcategory');
const mongoose = require('mongoose');

class SubCategoryRepo {

    // Add Sub category function
    async createSubCategory(subcategoryData) {
        return await SubCategoryModel.create(subcategoryData);
    }

    // All Sub category function
    async allSubCategories() {
        return await SubCategoryModel.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'undercategories'
                }
            },
            { $unwind: '$undercategories' }
        ])
    }

    // single subcategory function 
    async oneSubCategory(id) {
        return await SubCategoryModel.findById(id);
    }

    // Update sub category 
    async updateSubCategory(id, subcategoryData) {
        return await SubCategoryModel.findByIdAndUpdate(id, subcategoryData)
    }

    // Delete subcategory 
    async deleteSubCategory(id) {
        return await SubCategoryModel.findByIdAndDelete(id);
    }

    // Find by sub category name
    async findByName(subname) {
        return await SubCategoryModel.findOne({ subname: { $regex: new RegExp(`^${subname}$`, 'i') } });
    }

    // Sub Category wise product
    async SubcatWiseProduct(subcategoryId) {
        return SubCategoryModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(subcategoryId) }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'subcategoryId',
                    as: 'products',
                    pipeline: [
                        {
                            $match: { active: true }
                        }
                    ]
                }
            }
        ]);
    }


}

module.exports = new SubCategoryRepo(); 