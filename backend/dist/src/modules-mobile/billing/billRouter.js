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
const service = __importStar(require("./billService"));
const router = express_1.default.Router();
// 1. ดึงรายการบิลทั้งหมด (แท็บ บิล)
// GET /bills
router.get("/bills", authenticate_1.authenticate, async (req, res) => {
    try {
        const data = await service.getBills(req.user.id);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 2. ดึงข้อมูลครบถ้วนสำหรับ PDF
// GET /bills/:billId/detail
router.get("/bills/:billId/detail", authenticate_1.authenticate, async (req, res) => {
    try {
        const data = await service.getBillDetail(req.params.billId, req.user.id);
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// 3. ดึงข้อมูลสำหรับหน้าชำระเงิน
// GET /bills/:billId/payment-info
router.get("/bills/:billId/payment-info", authenticate_1.authenticate, async (req, res) => {
    try {
        const data = await service.getBillPaymentInfo(req.params.billId, req.user.id);
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// 3. ชำระเงิน + อัพโหลดสลิป
// POST /bills/:billId/payments
// body: { slipUrl, amount }
router.post("/bills/:billId/payments", authenticate_1.authenticate, async (req, res) => {
    try {
        const data = await service.submitPayment(req.params.billId, req.user.id, req.body);
        res.status(201).json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=billRouter.js.map