"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const UploadService = __importStar(require("./uploadService"));
const authenticate_1 = require("../../middlewares/authenticate");
const router = (0, express_1.Router)();
// multer — เก็บใน memory ก่อน แล้วค่อย upload ขึ้น Supabase
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error("Only JPG, PNG, WEBP are allowed"));
    },
});
//  อัพโหลดรูปภาพเดียว 
// POST /api/upload/image
// form-data: file (image)
router.post("/image", 
//authenticate,
upload.single("file"), (0, asyncHandler_1.asyncHandler)(UploadService.uploadImage));
//  อัพโหลดหลายรูป 
// POST /api/upload/images
// form-data: files[] (images)
router.post("/images", authenticate_1.authenticate, upload.array("files", 10), (0, asyncHandler_1.asyncHandler)(UploadService.uploadImages));
router.get("/test", (req, res) => {
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=uploadRouter.js.map