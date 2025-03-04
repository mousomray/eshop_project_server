const BannerRepo = require('../repository/bannerrepo')
const path = require('path')
const fs = require('fs')

class bannerAdminController {

    // Banner form
    async addbannerGet(req, res) {
        res.render('banner/addbanner', { user: req.user });
    }

    // Add data in blog
    async addbannerPost(req, res) {
        try {
            const { title, subtitle } = req.body;
            if (!title || !subtitle || !req.file) {
                req.flash('err', 'All fields are required')
                return res.redirect(generateUrl('addbanner'));
            }
            if (title.length && subtitle.length < 3) {
                req.flash('err', 'Title and Subtitle mustbe atleast 3 characters long')
                return res.redirect(generateUrl('addbanner'));
            }
            const bannerData = {
                title: title.trim(),
                subtitle: subtitle.trim(),
                image: req.file.path
            };
            await BannerRepo.createBanner(bannerData)
            req.flash('sucess', 'Banner added sucessfully')
            return res.redirect(generateUrl('bannerlist'));
        } catch (error) {
            console.error('Error saving banner:', error);
            req.flash('err', 'Error posting banner')
            return res.redirect(generateUrl('addbanner'));
        }
    }


    // Banner list
    async showbanner(req, res) {
        try {
            const banners = await BannerRepo.allBanners();
            res.render('banner/bannerlist', { banners, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving banners" });
        }
    }

    // Single banner 
    async singlebanner(req, res) {
        const id = req.params.id;
        try {
            const banner = await BannerRepo.oneBanner(id);
            if (!banner) {
                return res.status(404).send('Banner not found');
            }
            res.render('banner/editbanner', { banner, user: req.user });
        } catch (error) {
            console.error('Error fetching banner:', error);
            return res.status(500).send('Error fetching banner');
        }
    }

    // Update banner 
    async updatebanner(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        if (req.file) {
            const banner = await BannerRepo.oneBanner(id); // Find banner by id
            const imagePath = path.resolve(__dirname, '../../../../', banner.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image file:', err);
                    } else {
                        console.log('Image file deleted successfully:', banner.image);
                    }
                });
            } else {
                console.log('File does not exist:', imagePath);
            }
        }
        // Deleting image from uploads folder end
        try {
            const { title, subtitle } = req.body;
            if (!title || !subtitle) {
                req.flash('err', 'All fields are required')
                return res.redirect(generateUrl('editbanner', { id }));
            }
            if (title.length || subtitle.length < 3) {
                req.flash('err', 'Title and Subtitle mustbe atleast 3 characters long')
                return res.redirect(generateUrl('editbanner', { id }));
            }
            const existingBanner = await BannerRepo.oneBanner(id)
            if (!existingBanner) {
                return res.status(404).send('Banner not found.');
            }
            const bannerData = {
                title: title.trim(),
                subtitle: subtitle.trim(),
                image: req.file ? req.file.path : existingBanner.image,
            };
            await BannerRepo.updateBanner(id, bannerData);
            console.log(`Banner with ID ${id} updated`);
            req.flash('sucess', 'Banner updated successfully');
            return res.redirect(generateUrl('bannerlist'));
        } catch (error) {
            console.error('Error updating banner:', error);
            return res.status(500).send('Error updating blog');
        }
    }

    // Handle DELETE for delete banner
    async deletebanner(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        const banner = await BannerRepo.oneBanner(id)
        const imagePath = path.resolve(__dirname, '../../../../', banner.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image file deleted successfully:', banner.image);
                }
            });
        } else {
            console.log('File does not exist:', imagePath);
        }
        // Deleting image from uploads folder end
        try {
            await BannerRepo.deleteBanner(id);
            req.flash('sucess', "Banner delete sucessfully")
            return res.redirect(generateUrl('bannerlist'));
        } catch (error) {
            console.error('Error deleting banner:', error);
            return res.status(500).send('Error deleting banner');
        }
    }

}

module.exports = new bannerAdminController();