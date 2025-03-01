const BannerRepo = require('../module/banner/repository/bannerrepo')

class bannerApiController {

    // Banner list
    async showbanner(req, res) {
        try {
            const banners = await BannerRepo.allBanners();
            res.status(200).json({ succes: true, message: "Banner data retrive sucessfully", banners, total: banners.length });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving banners" });
        }
    }

}

module.exports = new bannerApiController();