const AuthRepo = require('../../auth/repository/authrepo')
const ProductRepo = require('../repository/productrepo')
const BrandRepo = require('../../brand/repository/BrandRepo')
const CategoryRepo = require('../../category/repository/CategoryRepo')
const SubCatRepo = require('../../subcategory/repository/SubCatRepo')
const path = require('path');
const fs = require('fs');

class productAdminController {

    // Add product form
    async addProduct(req, res) {
        const brands = await BrandRepo.allBrands();
        const categories = await CategoryRepo.allCategories();
        const subcategories = await SubCatRepo.allSubCategories();
        res.render('product/addproduct', { brands, categories, subcategories, user: req.user })
    }

    // Add data in product 
    async addproductPost(req, res) {
        try {
            const { title, description, brandId, categoryId, subcategoryId, price } = req.body;
            if (!title || !description || !brandId || !categoryId || !subcategoryId || !req.file || !price) {
                req.flash('err', 'All fields are required')
                return res.redirect(generateUrl('addproduct'));
            }
            if (title.length < 3) {
                req.flash('err', 'Title mustbe atleast 3 characters long')
                return res.redirect(generateUrl('addproduct'));
            }
            if (description.length < 10) {
                req.flash('err', 'Description mustbe atleast 10 characters long')
                return res.redirect(generateUrl('addproduct'));
            }
            const productData = {
                title: title.trim(),
                description: description.trim(),
                brandId: brandId.trim(),
                categoryId: categoryId.trim(),
                subcategoryId: subcategoryId.trim(),
                price: price,
                image: req.file.path
            };
            await ProductRepo.createProduct(productData);
            req.flash('sucess', 'Product added sucessfully')
            return res.redirect(generateUrl('productlist'));
        } catch (error) {
            console.error('Error saving product:', error);
            req.flash('err', 'Error posting product')
            return res.redirect(generateUrl('addproduct'));
        }
    }

    // Get product list 
    async showproduct(req, res) {
        try {
            const products = await ProductRepo.allProducts();
            console.log("Amar product...", products)
            res.render('product/productlist', { products, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving products" });
        }
    }

    // Handle Toggle Active Product
    async toggleProductActive(req, res) {
        try {
            const productId = req.params.id;
            const product = await ProductRepo.oneProduct(productId);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            product.active = !product.active;
            await product.save();
            req.flash('sucess', "Active status change sucessfully")
            res.redirect(generateUrl('productlist'));
        } catch (error) {
            console.error(error);
            req.flash('err', "This blog is not active for user")
            res.status(500).json({ message: "Error updating blog status" });
        }
    }

    // Single product 
    async singleproduct(req, res) {
        const id = req.params.id;
        try {
            const product = await ProductRepo.oneProduct(id);
            const brands = await BrandRepo.allBrands();
            const categories = await CategoryRepo.allCategories();
            const subcategories = await SubCatRepo.allSubCategories();
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.render('product/editproduct', { product, brands, categories, subcategories, user: req.user });
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).send('Error fetching product');
        }
    }

    // Handle PUT or PATCH for update blog
    async updateproduct(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        if (req.file) {
            const product = await ProductRepo.oneProduct(id); // Find product by id
            const imagePath = path.resolve(__dirname, '../../../../', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image file:', err);
                    } else {
                        console.log('Image file deleted successfully:', product.image);
                    }
                });
            } else {
                console.log('File does not exist:', imagePath);
            }
        }
        // Deleting image from uploads folder end
        try {
            const { title, description, brandId, categoryId, subcategoryId, price } = req.body;
            if (!title || !description || !brandId || !categoryId || !subcategoryId || !price) {
                req.flash('err', 'All fields are required')
                return res.redirect(generateUrl('editproduct', { id }));
            }
            if (title.length < 3) {
                req.flash('err', 'Title mustbe atleast 3 characters long')
                return res.redirect(generateUrl('editproduct', { id }));
            }
            if (description.length < 10) {
                req.flash('err', 'Description mustbe atleast 10 characters long')
                return res.redirect(generateUrl('editproduct', { id }));
            }
            const existingProduct = await ProductRepo.oneProduct(id)
            if (!existingProduct) {
                return res.status(404).send('Blog not found.');
            }
            const productData = {
                title: title.trim(),
                description: description.trim(),
                brandId: brandId.trim(),
                categoryId: categoryId.trim(),
                subcategoryId: subcategoryId.trim(),
                price: price,
                image: req.file ? req.file.path : existingProduct.image,
            };
            // Update the blog
            await ProductRepo.updateproduct(id, productData);
            console.log(`Product with ID ${id} updated`);
            req.flash('sucess', 'Product updated successfully');
            return res.redirect(generateUrl('productlist'));
        } catch (error) {
            console.error('Error updating product:', error);
            return res.status(500).send('Error updating product');
        }
    }

    // Handle DELETE for delete product
    async deleteproduct(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        const product = await ProductRepo.oneProduct(id)
        const imagePath = path.resolve(__dirname, '../../../../', product.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image file deleted successfully:', product.image);
                }
            });
        } else {
            console.log('File does not exist:', imagePath);
        }
        // Deleting image from uploads folder end
        try {
            await ProductRepo.deleteproduct(id)
            req.flash('sucess', "Product deleted sucessfully")
            return res.redirect(generateUrl('productlist')); // Redirect product after deleting data
        } catch (error) {
            console.error('Error deleting product:', error);
            return res.status(500).send('Error deleting product');
        }
    }

    // Handle Toggle Active Product
    async toggleProductActive(req, res) {
        try {
            const productId = req.params.id;
            const product = await ProductRepo.oneProduct(productId);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            product.active = !product.active;
            await product.save();
            req.flash('sucess', "Active status change sucessfully")
            res.redirect(generateUrl('productlist'));
        } catch (error) {
            console.error(error);
            req.flash('err', "This blog is not active for user")
            res.status(500).json({ message: "Error updating blog status" });
        }
    }

    // Search product
    async search(req, res) {
        const { title } = req.query;
        try {
            const products = await ProductRepo.adminSearchProduct(title)
            res.render("product/productlist", { products, user: req.user })
        } catch (error) {
            console.error("Error retrieving search products:", error);
            res.status(500).json({ message: "Error retrieving products" });
        }
    }

    // Show all orders for admin 
    async allOrderAdmin(req, res) {
        try {
            const orders = await ProductRepo.orderListAdmin();
            console.log("My ooo", orders)
            res.render('order/orderlist', { orders, user: req.user })
        } catch (error) {
            console.log("Error fetching order...", error);

        }
    }

    // Update status
    async StatusUpdate(req, res) {
        try {
            const { orderId, orderStatus } = req.body;
            if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
                return res.status(400).send("Invalid status");
            }
            const orderdata = await ProductRepo.orderListAdmin();
            console.log("for testing...", orderdata)
            await ProductRepo.updateStatus(orderId, orderStatus)
            res.redirect(generateUrl('allorderlist'));
        } catch (error) {
            console.error("Error updating order status:", error);
            res.status(500).send("Internal Server Error");
        }
    };

    // Dashboard Page 
    async dashboard(req, res) {
        const orders = await ProductRepo.orderListAdmin();
        const products = await ProductRepo.allProducts();
        const registers = await AuthRepo.registrationList();
        const categories = await CategoryRepo.allCategories();
        const subcategories = await SubCatRepo.allSubCategories();
        const brands = await BrandRepo.allBrands();
        return res.render('dashboard/dashboard', { orders, products, registers, categories, subcategories, brands, user: req.user })
    }

}

module.exports = new productAdminController();