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
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const authorizePropertyAdmin_1 = require("../../middlewares/authorizePropertyAdmin");
const service = __importStar(require("./propertyService"));
const router = express_1.default.Router();
router.get("/properties", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), async (req, res) => {
    try {
        res.json(await service.getMyProperties(req.user.id));
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/properties", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), async (req, res) => {
    try {
        res.status(201).json(await service.createProperty({ ...req.body, userId: req.user.id }));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.get("/properties/:propertyId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.getPropertyDetail(req.params.propertyId));
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.put("/properties/:propertyId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.updateProperty(req.params.propertyId, req.body));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete("/properties/:propertyId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        await service.deleteProperty(req.params.propertyId);
        res.json({ message: "Property deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/properties/:propertyId/images", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.status(201).json(await service.addPropertyImages(req.params.propertyId, req.body.urls));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete("/properties/:propertyId/images/:imageId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        await service.deletePropertyImage(req.params.propertyId, req.params.imageId);
        res.json({ message: "Image deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.patch("/properties/:propertyId/images/:imageId/cover", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        await service.setCoverImage(req.params.propertyId, req.params.imageId);
        res.json({ message: "Cover image updated" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.get("/properties/:propertyId/room-types", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.getRoomTypes(req.params.propertyId));
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/properties/:propertyId/room-types", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.status(201).json(await service.createRoomType(req.params.propertyId, req.body));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.get("/properties/:propertyId/room-types/:roomTypeId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.getRoomTypeDetail(req.params.roomTypeId));
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.delete("/properties/:propertyId/room-types/:roomTypeId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.deleteRoomType(req.params.roomTypeId));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put("/properties/:propertyId/room-types/:roomTypeId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.updateRoomType(req.params.roomTypeId, req.body));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/properties/:propertyId/room-types/:roomTypeId/images", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.status(201).json(await service.addRoomTypeImages(req.params.roomTypeId, req.body.urls));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete("/properties/:propertyId/room-types/:roomTypeId/images/:imageId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        await service.deleteRoomTypeImage(req.params.roomTypeId, req.params.imageId);
        res.json({ message: "Image deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ── Resolve short Google Maps URL → ดึง final URL แล้วคืนกลับ ──
router.get("/resolve-map-url", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), async (req, res) => {
    const url = req.query.url;
    if (!url)
        return res.status(400).json({ error: "url is required" });
    try {
        const response = await fetch(url, { method: "HEAD", redirect: "follow" });
        res.json({ resolvedUrl: response.url });
    }
    catch (_a) {
        res.status(400).json({ error: "ไม่สามารถ resolve URL ได้" });
    }
});
exports.default = router;
//# sourceMappingURL=propertyRouter.js.map