const BannerModel = require('../model/banner');

class BannerRepo {

    // Add banner function
    async createBanner(bannerData) {
        return await BannerModel.create(bannerData);
    }

    // All banners function
    async allBanners() {
        return await BannerModel.find();
    }

    // single banner function 
    async oneBanner(id) {
        return await BannerModel.findById(id);
    }

    // Update banner 
    async updateBanner(id, bannerData) {
        return await BannerModel.findByIdAndUpdate(id, bannerData)
    }

    // Delete banner 
    async deleteBanner(id) {
        return await BannerModel.findByIdAndDelete(id);
    }
}

module.exports = new BannerRepo(); 
