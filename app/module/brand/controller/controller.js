const BrandRepo = require('../repository/BrandRepo')
const mongoose = require('mongoose')

class brandAdminController {

    // category form
    async addbrandGet(req, res) {
        const brands = await BrandRepo.allBrands()
        res.render('brand/addbrand', { brands, user: req.user });
    }

    // Add data in brand
    async addbrandPost(req, res) {
        try {
            const { name } = req.body;
            const existingBrand = await BrandRepo.findByName(name)
            if (existingBrand) {
                req.flash('err', 'This brand already exist');
                return res.redirect(generateUrl('addbrand'));
            }
            if (!name) {
                req.flash('err', 'Name is required')
                return res.redirect(generateUrl('addbrand'));
            }
            const brandData = {
                name: name.trim(),
            };
            await BrandRepo.createBrand(brandData)
            req.flash('sucess', 'Brand posted sucessfully')
            return res.redirect(generateUrl('brandlist'));
        } catch (error) {
            console.error('Error saving brand:', error);
            req.flash('err', 'Error posting brand')
            return res.redirect(generateUrl('addbrand'));
        }
    }


    // brand list
    async showbrand(req, res) {
        try {
            const brands = await BrandRepo.allBrands();
            res.render('brand/brandlist', { brands, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving brands" });
        }
    }

    // Single brand 
    async singlebrand(req, res) {
        const id = req.params.id;
        try {
            const brand = await BrandRepo.oneBrand(id)
            if (!brand) {
                return res.status(404).send('Brand not found');
            }
            res.render('brand/editbrand', { brand, user: req.user });
        } catch (error) {
            console.error('Error fetching brand:', error);
            return res.status(500).send('Error fetching brand');
        }
    }

    // Update brand 
    async updatebrand(req, res) {
        const id = req.params.id;
        try {
            const { name } = req.body;
            const existingBrand = await BrandRepo.findByName(name)
            if (existingBrand) {
                req.flash('err', 'This brand already exist');
                return res.redirect(generateUrl('editbrand', { id }));
            }
            if (!name) {
                return res.status(400).send('All fields are required.');
            }
            const brandData = {
                name: name.trim()
            };
            await BrandRepo.updateBrand(id, brandData)
            console.log(`Category with ID ${id} updated`);
            req.flash('sucess', 'Brand updated successfully');
            return res.redirect(generateUrl('brandlist'));
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).send('Error updating category');
        }
    }

    // Handle DELETE for delete category
    async deletebrand(req, res) {
        const id = req.params.id;
        try {
            await BrandRepo.deleteBrand(id)
            req.flash('sucess', "Brand deleted sucessfully")
            return res.redirect(generateUrl('brandlist'));
        } catch (error) {
            console.error('Error deleting brand:', error);
            return res.status(500).send('Error deleting brand');
        }
    }

}
module.exports = new brandAdminController();