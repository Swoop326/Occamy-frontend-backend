const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: `occamy_visits/${req.user.id}`,

            allowed_formats: ["jpg", "jpeg", "png", "webp"],

            public_id: `visit_${Date.now()}`, // ⭐ THIS replaces filename

            transformation: [{ quality: "auto" }]
        };
    }
});

module.exports = storage;
