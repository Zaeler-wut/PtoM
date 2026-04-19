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
const service = __importStar(require("./bookingService"));
const router = express_1.default.Router();
router.get("/properties/:propertyId/bookings", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.getBookings(req.params.propertyId));
    }
    catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/properties/:propertyId/bookings/:bookingId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.getBookingDetail(req.params.bookingId, req.params.propertyId));
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.get("/properties/:propertyId/bookings/:bookingId/contract-prefill", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.getBookingForContract(req.params.bookingId, req.params.propertyId));
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// ยืนยัน booking + auto assign ห้อง
router.patch("/properties/:propertyId/bookings/:bookingId/confirm", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.confirmBooking(req.params.bookingId, req.params.propertyId));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ยกเลิก booking
router.patch("/properties/:propertyId/bookings/:bookingId/cancel", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.cancelBooking(req.params.bookingId, req.params.propertyId));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=bookingRouter.js.map