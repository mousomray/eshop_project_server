const ProductRepo = require('../module/product/repository/productrepo')
const CategoryRepo = require('../module/category/repository/CategoryRepo')
const SubCategoryRepo = require('../module/subcategory/repository/SubCatRepo')
const BrandRepo = require('../module/brand/repository/BrandRepo')

class productApiController {

    // Product list with pagination
    async showproduct(req, res) {
        try {
            const page = parseInt(req.query.page) || 1
            const limit = 6
            const totalData = await ProductRepo.countProduct();
            const totalPage = Math.ceil(totalData / limit)
            const nextPage = totalPage > page ? page + 1 : null
            const prevPage = page > 1 ? page - 1 : null

            const products = await ProductRepo.getActiveProducts(page, limit);
            res.status(200).json({
                message: "Product retrieved successfully",
                products,
                pagination: {
                    page,
                    prevPage,
                    nextPage,
                    totalPage,
                    totalData,
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving products" });
        }
    }

    // Product details
    async productDetails(req, res) {
        try {
            const id = req.params.id
            const product = await ProductRepo.detailsProduct(id)
            res.status(200).json({ message: "Single product fetched", product })
        } catch (error) {
            console.log("Error fetching product...", error);

        }
    }

    // Fetch categories and subcategories
    async catAndSubCat(req, res) {
        try {
            const categories = await CategoryRepo.catWiseSubcategory();
            res.status(200).json({ message: "Category wise subcategory is fetched", categories })
        } catch (error) {
            console.log("Error fetching categories...", error);

        }
    }

    // Fetching brand with product
    async brandWithProductCount(req, res) {
        try {
            const brands = await BrandRepo.brandWithCount();
            res.status(200).json({ message: "Brand is fetched", brands })
        } catch (error) {
            console.log("Error fetching brands...", error);

        }
    }

    // Sub categorywise product
    async subCatWiseproduct(req, res) {
        const subcategoryId = req.params.id;
        try {
            const subcategorydetails = await SubCategoryRepo.SubcatWiseProduct(subcategoryId)
            res.status(200).json({ message: "Subcategory wise product fetched", subcategorydetails })
        } catch (error) {
            console.log("Error fetching subcategories...", error);
        }
    }

    // Brandwise product
    async brandwiseproduct(req, res) {
        const brandId = req.params.id;
        try {
            const branddetails = await BrandRepo.brandWiseProduct(brandId)
            res.status(200).json({ message: "Brand wise product fetched", branddetails })
        } catch (error) {
            console.log("Error fetching brands...", error);
        }
    }

    // Search with query parameter
    async search(req, res) {
        const { title } = req.query;
        const filter = {};
        if (title) {
            filter.title = { $regex: new RegExp(title, 'i') };
        }
        try {
            const products = await ProductRepo.getSearchProduct(filter);
            res.status(200).json({
                message: 'Search products retrieved successfully',
                total: products.length,
                products
            });
        } catch (error) {
            console.error('Error retrieving search products:', error);
            res.status(500).json({ message: 'Error retrieving products' });
        }
    }

    // Handle addToCart here

    //-----Cart Area-------

    // Add cart
    async addToCart(req, res) {
        try {
            const userId = req.user._id;
            const { productId, quantity } = req.body;
            if (!userId || !productId) {
                return res.status(400).json({ message: 'User ID and Product ID are required' });
            }
            const validQuantity = quantity && quantity > 0 ? quantity : 1;
            const product = await ProductRepo.oneProduct(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            let cart = await ProductRepo.findCartByuserId(userId);
            if (cart) {
                const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
                if (productIndex > -1) {
                    cart.products[productIndex].quantity += validQuantity;
                } else {
                    cart.products.push({ productId, quantity: validQuantity });
                }
            } else {
                const products = [{ productId, quantity: validQuantity }];
                cart = await ProductRepo.createCart(userId, products);
            }
            await ProductRepo.updateCart(cart);
            res.status(200).json({ message: 'Cart item added successfully', cart });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Show all carts
    async getCart(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            const cartData = await ProductRepo.findCartandLookup(userId);
            if (!cartData || cartData.length === 0) {
                return res.status(404).json({ message: "Cart not found or empty" });
            }

            const cart = cartData[0]; // Extract first object from array

            res.status(200).json({
                message: "Cart retrieved successfully",
                cart: {
                    userId: cart.userId,
                    products: cart.products,
                    grossAmount: cart.grossAmount // Adding gross amount to response
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    }

    // Decrease cart item
    async lessCart(req, res) {
        try {
            const userId = req.user?._id;
            const { productId, quantity = 1 } = req.body;
            if (!userId || !productId) {
                return res.status(400).json({ message: 'User ID and Product ID are required' });
            }
            const product = await ProductRepo.oneProduct(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            let cart = await ProductRepo.findCartByuserId(userId);
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found for this user' });
            }
            const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }
            // Decrease quantity or remove item
            cart.products[productIndex].quantity -= quantity;
            if (cart.products[productIndex].quantity <= 0) {
                cart.products.splice(productIndex, 1);
            }
            // Update cart in DB
            if (cart.products.length === 0) {
                await ProductRepo.deleteCart(userId); // If empty, remove cart completely
                return res.status(200).json({ message: 'Cart is now empty', cart: [] });
            } else {
                await ProductRepo.updateCart(cart);
            }
            // Fetch updated cart with lookup
            const lookupCart = await ProductRepo.findCartandLookup(userId);
            // Calculate total cart value
            let totalCartPrice = lookupCart[0]?.products.reduce((total, item) => {
                return total + (item.quantity * (item.productId?.price || 0));
            }, 0) || 0;
            res.status(200).json({
                message: 'Cart item removed or updated',
                cart: lookupCart[0] || { userId, products: [] },
                totalCartPrice,
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Delete Cart
    async deleteCart(req, res) {
        try {
            const userId = req.user._id; // Get user ID from token
            const { productId } = req.body; // Get productId from request
            if (!userId || !productId) {
                return res.status(400).json({ message: 'User ID and Product ID are required' });
            }
            let cart = await ProductRepo.findCartByuserId(userId);
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found for this user' });
            }
            // Find product in cart
            const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }
            // Remove product from cart
            cart.products.splice(productIndex, 1);
            await ProductRepo.updateCart(cart);
            res.status(200).json({ message: 'Product removed from cart successfully', cart });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    //------Order area ----------

    // Create Order Controller
    async createOrder(req, res) {
        try {
            const userId = req.user?._id;
            const { shippingAddress } = req.body;
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country || !shippingAddress.paymentmethod) {
                return res.status(400).json({ message: "Complete shipping address is required" });
            }
            const order = await ProductRepo.placeOrder(userId, shippingAddress);
            res.status(201).json({
                message: "Order placed successfully",
                order
            });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    }

    // Order find by userID controller 
    async useOrderList(req, res) {
        try {
            const userId = req.user._id
            const orders = await ProductRepo.showOrderbyUser(userId)
            res.json({ message: "Order list fetched", orders })
        } catch (error) {
            console.log("Error fetching order data...", error);
        }
    }

}

module.exports = new productApiController();








