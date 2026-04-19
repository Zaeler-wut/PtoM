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
const service = __importStar(require("./propertyService"));
const router = express_1.default.Router();
router.get("/properties/featured", async (_req, res) => {
    try {
        const data = await service.getFeaturedProperties();
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.get("/properties", async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);
        const maxOccupants = req.query.maxOccupants
            ? parseInt(req.query.maxOccupants)
            : undefined;
        const radius = req.query.radius
            ? parseFloat(req.query.radius)
            : 20;
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: "lat and lng are required" });
        }
        if (isNaN(month) || isNaN(year)) {
            return res.status(400).json({ error: "month and year are required" });
        }
        const day = req.query.day ? parseInt(req.query.day) : undefined;
        const data = await service.searchProperties({
            lat, lng, month, year, day, maxOccupants, radius,
        });
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
router.get("/properties/:propertyId/room-types/:roomTypeId", async (req, res) => {
    try {
        const data = await service.getRoomTypeDetail(req.params.propertyId, req.params.roomTypeId);
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.get("/properties/:propertyId", async (req, res) => {
    try {
        const month = req.query.month ? parseInt(req.query.month) : undefined;
        const year = req.query.year ? parseInt(req.query.year) : undefined;
        const day = req.query.day ? parseInt(req.query.day) : undefined;
        const maxOccupants = req.query.maxOccupants
            ? parseInt(req.query.maxOccupants)
            : undefined;
        const data = await service.getPropertyDetail(req.params.propertyId, {
            month, year, day, maxOccupants,
        });
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=propertyRouter.js.map