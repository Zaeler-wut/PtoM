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
const service = __importStar(require("./moveOutService"));
const router = express_1.default.Router();
// 1. รายการแจ้งย้ายออก + บิลที่ออกแล้ว
// GET /properties/:propertyId/move-out
router.get("/properties/:propertyId/move-out", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : undefined;
        const status = req.query.status;
        const data = await service.getMoveOutList(req.params.propertyId, { year, status });
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// 2. Preview — คำนวณยอดก่อนสร้างบิล (realtime)
// POST /properties/:propertyId/move-out/:contractId/preview
// body: { moveOutDate, billingStartDay, billingEndDay,
//         waterStart, waterEnd, electricStart, electricEnd,
//         damageItems?, additionalItems? }
router.post("/properties/:propertyId/move-out/:contractId/preview", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.getMoveOutPreview(req.params.contractId, req.params.propertyId, req.body);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
// 3. สร้างบิลแจ้งออก
// POST /properties/:propertyId/move-out/:contractId/bill
// body: { moveOutDate, billingStartDay, billingEndDay,
//         waterStart, waterEnd, electricStart, electricEnd,
//         damageItems?, additionalItems? }
router.post("/properties/:propertyId/move-out/:contractId/bill", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.createMoveOutBill(req.params.contractId, req.params.propertyId, req.body);
        res.status(201).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
// 4. ดูรายละเอียดบิลแจ้งออก
// GET /properties/:propertyId/move-out/bills/:moveOutBillId
router.get("/properties/:propertyId/move-out/bills/:moveOutBillId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.getMoveOutBillDetail(req.params.moveOutBillId, req.params.propertyId);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=moveOutRouter.js.map