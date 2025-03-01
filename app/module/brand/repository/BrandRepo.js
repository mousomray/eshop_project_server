const BrandModel = require('../model/brand');
const mongoose = require('mongoose');

class BrandRepo {

    // Add brand function
    async createBrand(brandData) {
        return await BrandModel.create(brandData);
    }

    // All brand function
    async allBrands() {
        return await BrandModel.find();
    }

    // single brand function 
    async oneBrand(id) {
        return await BrandModel.findById(id);
    }

    // Update brand 
    async updateBrand(id, brandData) {
        return await BrandModel.findByIdAndUpdate(id, brandData)
    }

    // Delete brand 
    async deleteBrand(id) {
        return await BrandModel.findByIdAndDelete(id);
    }

    // Find by brand name
    async findByName(name) {
        return await BrandModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }

    // Brand with count
    async brandWithCount() {
        return BrandModel.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "brandId",
                    as: "branddetails",
                    pipeline: [
                        {
                            $match: { active: true }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        brandId: "$_id",
                        name: "$name"
                    },
                    totalproducts: { $sum: { $size: "$branddetails" } }
                }
            }
        ])
    }

    // Brand wise product
    async brandWiseProduct(brandId) {
        return BrandModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(brandId) }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'brandId',
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

module.exports = new BrandRepo(); 