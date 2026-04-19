"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
//  Cloudinary config 
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const FOLDER = (_a = process.env.CLOUDINARY_FOLDER) !== null && _a !== void 0 ? _a : "ptom";
//  Helper: upload buffer  Cloudinary 
async function uploadToCloudinary(buffer, mimetype, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: `${FOLDER}/${folder}`,
            public_id: (0, uuid_1.v4)(),
            resource_type: "image",
            transformation: [
                { width: 1200, height: 800, crop: "limit" }, // resize
                { quality: "auto:good" }, // auto compress
                { fetch_format: "auto" }, // auto format (webp ถ้า browser รองรับ)
            ],
        }, (error, result) => {
            if (error)
                return reject(new Error(error.message));
            resolve(result.secure_url);
        });
        uploadStream.end(buffer);
    });
}
//  POST /api/upload/image 
const uploadImage = async (req, res) => {
    var _a;
    const file = req.file;
    if (!file)
        throw new Error("No file uploaded");
    const folder = (_a = req.query.folder) !== null && _a !== void 0 ? _a : "general";
    const url = await uploadToCloudinary(file.buffer, file.mimetype, folder);
    res.json({ url });
};
exports.uploadImage = uploadImage;
//  POST /api/upload/images 
const uploadImages = async (req, res) => {
    var _a;
    const files = req.files;
    if (!files || files.length === 0)
        throw new Error("No files uploaded");
    const folder = (_a = req.query.folder) !== null && _a !== void 0 ? _a : "general";
    const urls = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer, f.mimetype, folder)));
    res.json({ urls });
};
exports.uploadImages = uploadImages;
//# sourceMappingURL=uploadService.js.map