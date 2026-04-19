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
const service = __importStar(require("./billingService"));
const router = express_1.default.Router();
function parseMonthYear(query) {
    const month = parseInt(query.month);
    const year = parseInt(query.year);
    if (!month || month < 1 || month > 12)
        throw new Error("Invalid month");
    if (!year || year < 2000)
        throw new Error("Invalid year");
    return { month, year };
}
// 1. Summary cards + ตาราง
// GET /properties/:propertyId/billing/summary?month=3&year=2026
router.get("/properties/:propertyId/billing/summary", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const { month, year } = parseMonthYear(req.query);
        const data = await service.getBillingSummary(req.params.propertyId, month, year);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});
// 2. ค่าบริการคงที่ของห้อง
// GET /properties/:propertyId/billing/:contractId/fees
router.get("/properties/:propertyId/billing/:contractId/fees", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.getRoomFees(req.params.contractId, req.params.propertyId);
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// 3. ใบแจ้งหนี้ (realtime)
// GET /properties/:propertyId/billing/:contractId/invoice?month=3&year=2026
router.get("/properties/:propertyId/billing/:contractId/invoice", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const { month, year } = parseMonthYear(req.query);
        const data = await service.getInvoice(req.params.contractId, req.params.propertyId, month, year);
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// 4. แก้ไขมิเตอร์ + รายการเพิ่มเติม
// PUT /properties/:propertyId/billing/:contractId/meter?month=3&year=2026
// body: { waterMeter, electricMeter, additionalItems? }
router.put("/properties/:propertyId/billing/:contractId/meter", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const { month, year } = parseMonthYear(req.query);
        const data = await service.updateMeter(req.params.contractId, req.params.propertyId, month, year, req.body);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// 5. ส่งบิลห้องเดียว
// POST /properties/:propertyId/billing/:contractId/send?month=3&year=2026
router.post("/properties/:propertyId/billing/:contractId/send", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const { month, year } = parseMonthYear(req.query);
        const data = await service.sendBill(req.params.contractId, req.params.propertyId, month, year);
        res.status(201).json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// 6. ส่งบิลทั้งหมด
// POST /properties/:propertyId/billing/send-all?month=3&year=2026
router.post("/properties/:propertyId/billing/send-all", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const { month, year } = parseMonthYear(req.query);
        const data = await service.sendAllBills(req.params.propertyId, month, year);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// อัพโหลดสลิปแทนผู้เช่า (admin)
// POST /properties/:propertyId/billing/bills/:billId/payment
router.post("/properties/:propertyId/billing/bills/:billId/payment", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        res.json(await service.submitPaymentByAdmin(req.params.billId, req.params.propertyId, req.body));
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ตรวจสอบการชำระเงิน
// GET /properties/:propertyId/billing/payments?month=3&year=2026&status=VERIFYING
router.get("/properties/:propertyId/billing/payments", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const { month, year } = parseMonthYear(req.query);
        const data = await service.getPayments(req.params.propertyId, month, year, req.query.status);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ดูข้อมูล payment
// GET /properties/:propertyId/billing/payments/:paymentId
router.get("/properties/:propertyId/billing/payments/:paymentId", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.getPaymentDetail(req.params.paymentId, req.params.propertyId);
        res.json(data);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// ยืนยันการชำระเงิน → PAID
// PATCH /properties/:propertyId/billing/payments/:paymentId/confirm
router.patch("/properties/:propertyId/billing/payments/:paymentId/confirm", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.confirmPayment(req.params.paymentId, req.params.propertyId, req.user.email);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ปฏิเสธการชำระเงิน → กลับเป็น PENDING
// PATCH /properties/:propertyId/billing/payments/:paymentId/reject
router.patch("/properties/:propertyId/billing/payments/:paymentId/reject", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const data = await service.rejectPayment(req.params.paymentId, req.params.propertyId);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /properties/:propertyId/billing/available-months
router.get("/properties/:propertyId/billing/available-months", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), (0, authorizePropertyAdmin_1.authorizePropertyAdmin)(), async (req, res) => {
    try {
        const rows = await service.getAvailableMonths(req.params.propertyId);
        res.json(rows);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=billingRouter.js.map