const CategoryRepo = require('../repository/CategoryRepo')
const mongoose = require('mongoose')

class categoryAdminController {

    // category form
    async addcategoryGet(req, res) {
        const categories = await CategoryRepo.allCategories();
        res.render('category/addcategory', { categories, user: req.user });
    }

    // Add data in category
    async addcategoryPost(req, res) {
        try {
            const { name } = req.body;
            const existingCategory = await CategoryRepo.findByName(name)
            if (existingCategory) {
                req.flash('err', 'This category already exist');
                return res.redirect(generateUrl('addcategory'));
            }
            if (!name) {
                req.flash('err', 'Name is required')
                return res.redirect(generateUrl('addcategory'));
            }
            if (name.length < 3) {
                req.flash('err', 'Category name must be atleast 3 characters long')
                return res.redirect(generateUrl('addcategory'));
            }
            const categoryData = {
                name: name.trim(),
            };
            await CategoryRepo.createCategory(categoryData)
            req.flash('sucess', 'Category posted sucessfully')
            return res.redirect(generateUrl('categorylist'));
        } catch (error) {
            console.error('Error saving category:', error);
            req.flash('err', 'Error posting category')
            return res.redirect(generateUrl('addcategory'));
        }
    }


    // category list
    async showcategory(req, res) {
        try {
            const categories = await CategoryRepo.allCategories();
            res.render('category/categorylist', { categories, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving categories" });
        }
    }

    // Single category 
    async singlecategory(req, res) {
        const id = req.params.id;
        try {
            const category = await CategoryRepo.oneCategory(id)
            const categories = await CategoryRepo.allCategories();
            if (!category) {
                return res.status(404).send('Category not found');
            }
            res.render('category/editcategory', { categories, category, user: req.user });
        } catch (error) {
            console.error('Error fetching category:', error);
            return res.status(500).send('Error fetching category');
        }
    }

    // Update category 
    async updatecategory(req, res) {
        const id = req.params.id;
        try {
            const { name } = req.body;
            const existingCategory = await CategoryRepo.findByName(name)
            if (existingCategory) {
                req.flash('err', 'This category already exist');
                return res.redirect(generateUrl('editcategory', { id }));
            }
            if (!name) {
                return res.status(400).send('All fields are required.');
            }
            if (name.length < 3) {
                req.flash('err', 'Category name must be atleast 3 characters long')
                return res.redirect(generateUrl('editcategory', { id }));
            }
            const categoryData = {
                name: name.trim()
            };
            await CategoryRepo.updateCategory(id, categoryData)
            console.log(`Category with ID ${id} updated`);
            req.flash('sucess', 'Category updated successfully');
            return res.redirect(generateUrl('categorylist'));
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).send('Error updating category');
        }
    }

    // Handle DELETE for delete category
    async deletecategory(req, res) {
        const id = req.params.id;
        try {
            await CategoryRepo.deleteCategory(id)
            req.flash('sucess', "category delete sucessfully")
            return res.redirect(generateUrl('categorylist'));
        } catch (error) {
            console.error('Error deleting category:', error);
            return res.status(500).send('Error deleting category');
        }
    }

    // Category wise product
    async catwiseproduct(req, res) {
        const categoryId = req.params.id;
        try {
            const mydata = await CategoryRepo.catWiseProduct(categoryId)
            console.log("Myyy...", mydata);
            const categories = await CategoryRepo.allCategories();
            res.render('category/catwiseproduct', { categories, mydata, user: req.user });
        } catch (error) {
            console.log("Error fetching products...", error);
            res.status(500).json({ error: 'Server error while fetching products' });
        }
    }


}

module.exports = new categoryAdminController();