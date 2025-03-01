const SubCategoryRepo = require('../repository/SubCatRepo')
const CategoryRepo = require('../../category/repository/CategoryRepo')
const mongoose = require('mongoose')

class SubcategoryAdminController {

    // category form
    async addsubcategoryGet(req, res) {
        const categories = await CategoryRepo.allCategories();
        res.render('subcategory/addsubcategory', { categories, user: req.user });
    }

    // Add data in category
    async addsubcategoryPost(req, res) {
        try {
            const { subname, categoryId } = req.body;
            const existingSubCategory = await SubCategoryRepo.findByName(subname)
            if (existingSubCategory) {
                req.flash('err', 'This sub category already exist');
                return res.redirect(generateUrl('addsubcategory'));
            }
            if (!subname) {
                req.flash('err', 'Subcategory is required')
                return res.redirect(generateUrl('addsubcategory'));
            }
            const subcategoryData = {
                subname: subname.trim(),
                categoryId: categoryId.trim(),
            };
            await SubCategoryRepo.createSubCategory(subcategoryData)
            req.flash('sucess', 'Subcategory posted sucessfully')
            return res.redirect(generateUrl('subcategorylist'));
        } catch (error) {
            console.error('Error saving category:', error);
            req.flash('err', 'Error posting category')
            return res.redirect(generateUrl('addsubcategory'));
        }
    }


    // category list
    async showsubcategory(req, res) {
        try {
            const subcategories = await SubCategoryRepo.allSubCategories()
            res.render('subcategory/subcategorylist', { subcategories, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving subcategories" });
        }
    }

    // Single category 
    async singlesubcategory(req, res) {
        const id = req.params.id;
        try {
            const subcategory = await SubCategoryRepo.oneSubCategory(id)
            const categories = await CategoryRepo.allCategories();
            console.log("My sub...", subcategory)
            if (!subcategory) {
                return res.status(404).send('Subcategory not found');
            }
            res.render('subcategory/editsubcategories', { categories, subcategory, user: req.user });
        } catch (error) {
            console.error('Error fetching category:', error);
            return res.status(500).send('Error fetching category');
        }
    }

    // Update category 
    async updatesubcategory(req, res) {
        const id = req.params.id;
        try {
            const { subname, categoryId } = req.body;
            const existingSubCategory = await SubCategoryRepo.findByName(subname)
            if (existingSubCategory) {
                req.flash('err', 'This category already exist');
                return res.redirect(generateUrl('editsubcategory', { id }));
            }
            if (!subname) {
                return res.status(400).send('All fields are required.');
            }
            const subcategoryData = {
                subname: subname.trim(),
                categoryId: categoryId.trim(),
            };
            await SubCategoryRepo.updateSubCategory(id, subcategoryData)
            console.log(`Category with ID ${id} updated`);
            req.flash('sucess', 'Subcategory updated successfully');
            return res.redirect(generateUrl('subcategorylist'));
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).send('Error updating category');
        }
    }

    // Handle DELETE for delete category
    async deletesubcategory(req, res) {
        const id = req.params.id;
        try {
            await SubCategoryRepo.deleteSubCategory(id)
            req.flash('sucess', "Subcategory delete sucessfully")
            return res.redirect(generateUrl('subcategorylist'));
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            return res.status(500).send('Error deleting subcategory');
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

module.exports = new SubcategoryAdminController();