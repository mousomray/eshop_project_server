const ProductModel = require('../model/product');
const CartModel = require('../model/cart');
const OrderModel = require('../model/order');
const mongoose = require('mongoose');

class ProductRepo {

    // Add product function
    async createProduct(productData) {
        return ProductModel.create(productData)
    }

    // All products function for admin pannel
    async allProducts() {
        return await ProductModel.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategoryId",
                    foreignField: "_id",
                    as: "subcategorydetails",
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categorydetails",
                }
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "brandId",
                    foreignField: "_id",
                    as: "branddetails",
                }
            },
            { $unwind: "$subcategorydetails" },
            { $unwind: "$categorydetails" },
            { $unwind: "$branddetails" },
        ]);
    }


    // Fetch product for api where I add pagination
    async getActiveProducts(page, limit) {
        const skip = (page - 1) * limit;
        return await ProductModel.find({ active: true }).skip(skip).limit(limit);
    }

    // Get search product with query parameter
    async getSearchProduct(filter) {
        return await ProductModel.find({ active: true, ...filter })
    }

    // Total product 
    async countProduct() {
        return await ProductModel.countDocuments({ active: true });
    }

    // Fetch single product
    async oneProduct(id) {
        return await ProductModel.findById(id);
    }

    // Fetch product details
    async detailsProduct(id) {
        return ProductModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brandId',
                    foreignField: '_id',
                    as: 'brand',
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subcategoryId',
                    foreignField: '_id',
                    as: 'subcategory',
                }
            },
            { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },
        ]);

    }

    // Update product 
    async updateproduct(id, productData) {
        return await ProductModel.findByIdAndUpdate(id, productData)
    }

    // Delete product 
    async deleteproduct(id) {
        return await ProductModel.findByIdAndDelete(id);
    }

    //  search product with query parameter for admin
    async adminSearchProduct(title) {
        return await ProductModel.aggregate([
            {
                $match: { title: { $regex: title, $options: "i" } } 
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategoryId",
                    foreignField: "_id",
                    as: "subcategorydetails",
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categorydetails",
                }
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "brandId",
                    foreignField: "_id",
                    as: "branddetails",
                }
            },
            { $unwind: "$subcategorydetails" },
            { $unwind: "$categorydetails" },
            { $unwind: "$branddetails" },
        ]);
    }
    

    // Fetch category list
    async fetchCategory() {
        return await ProductModel.distinct("category");
    }

    // Find by category 
    async categoryDetails(categoryRegex) {
        return await ProductModel.find({ active: true, category: categoryRegex });
    }

    /** Handle add to cart area */

    // Find cart by userId
    async findCartByuserId(userId) {
        return await CartModel.findOne({ userId });
    }

    // Create cart
    async createCart(userId, products) {
        return await CartModel.create({ userId, products });
    }

    // Save cart item into the database
    async updateCart(cart) {
        return await cart.save();
    }

    // Deleted cart of use
    async deleteCart(userId) {
        return await CartModel.deleteOne({ userId });
    }

    // Delete cart by id 
    async deleteIdWiseCart(id) {
        return await CartModel.findByIdAndDelete(id);
    }

    // Find cart with lookup 
    async findCartandLookup(userId) {
        return await CartModel.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    "products.productId": "$productDetails._id",
                    "products.title": "$productDetails.title",
                    "products.price": "$productDetails.price",
                    "products.image": "$productDetails.image",
                    "products.description": "$productDetails.description",
                    "products.category": "$productDetails.category",
                    "products.quantity": "$products.quantity",
                    "products.totalPrice": { $multiply: ["$products.quantity", "$productDetails.price"] }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    userId: { $first: "$userId" },
                    products: { $push: "$products" },
                    grossAmount: { $sum: "$products.totalPrice" }
                }
            }
        ]);
    }

    // Create Order Repository
    async placeOrder(userId, shippingAddress) {
        try {
            const cartData = await CartModel.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                {
                    $project: {
                        "products.productId": "$productDetails._id",
                        "products.title": "$productDetails.title",
                        "products.price": "$productDetails.price",
                        "products.quantity": "$products.quantity",
                        "products.totalPrice": { $multiply: ["$products.quantity", "$productDetails.price"] }
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        userId: { $first: "$userId" },
                        products: { $push: "$products" },
                        totalAmount: { $sum: "$products.totalPrice" }
                    }
                }
            ]);
            if (!cartData || cartData.length === 0) {
                throw new Error("Cart is empty, cannot place order.");
            }
            const cart = cartData[0]; // Extract first object from array
            const order = new OrderModel({
                userId: userId,
                products: cart.products,
                totalAmount: cart.totalAmount,
                shippingAddress,
                orderStatus: "pending",
                paymentStatus: "pending"
            });
            await order.save();
            await CartModel.findOneAndDelete({ userId });
            return order;
        } catch (error) {
            throw error;
        }
    }

    // Show order 
    async showOrderbyUser(userId) {
        return OrderModel.find({ userId })
    }

    // Create Payment 
    async findOrderById(id) {
        return OrderModel.findById(id)
    }

    // Show order list for admin pannel 
    async orderListAdmin() {
        return OrderModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userdetails'
                }
            },
            { $unwind: '$userdetails' }
        ])
    }

    // Change order status 
    async updateStatus(orderId, orderStatus) {
        return OrderModel.findByIdAndUpdate(orderId, { orderStatus, updatedAt: Date.now() }, { new: true });
    }
}

module.exports = new ProductRepo(); 
