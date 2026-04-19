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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPayment = exports.getBillDetail = exports.getBillPaymentInfo = exports.getBills = void 0;
const repo = __importStar(require("./billRepository"));
// HELPERS
const MONTH_TH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
function formatBillingPeriod(month, year, startDay, endDay) {
    if (!month || !year)
        return "-";
    const m = MONTH_TH[month - 1];
    const y = year + 543;
    const start = startDay !== null && startDay !== void 0 ? startDay : 1;
    const end = endDay !== null && endDay !== void 0 ? endDay : new Date(year, month, 0).getDate();
    return `${start.toString().padStart(2, "0")} - ${end.toString().padStart(2, "0")} ${m} ${y}`;
}
// ทำความสะอาด title: ตัด " × ฿X" ออก
function cleanItemTitle(title) {
    return title.replace(/ × ฿[\d.]+/g, "");
}
// 1. ดึงรายการบิลทั้งหมด
const getBills = async (userId) => {
    const bills = await repo.getBillsByUser(userId);
    const totalUnpaid = bills
        .filter((b) => b.status === "PENDING" || b.status === "VERIFYING")
        .reduce((sum, b) => sum + b.total, 0);
    const billCards = bills.map((bill) => {
        var _a, _b, _c, _d;
        const property = bill.contract.room.property;
        const items = bill.items.map((i) => ({
            title: cleanItemTitle(i.title),
            amount: i.amount,
        }));
        return {
            billId: bill.id,
            propertyName: property.name,
            billingPeriod: formatBillingPeriod(bill.month, bill.year),
            firstName: (_b = (_a = bill.user) === null || _a === void 0 ? void 0 : _a.firstName) !== null && _b !== void 0 ? _b : "",
            lastName: (_d = (_c = bill.user) === null || _c === void 0 ? void 0 : _c.lastName) !== null && _d !== void 0 ? _d : "",
            roomNumber: bill.room.roomNumber,
            items,
            total: bill.total,
            status: bill.status,
            dueDate: null,
            pdfUrl: bill.pdfUrl,
        };
    });
    return { totalUnpaid, bills: billCards };
};
exports.getBills = getBills;
// 2. ดึงข้อมูลสำหรับหน้าชำระเงิน
const getBillPaymentInfo = async (billId, userId) => {
    const bill = await repo.getBillById(billId, userId);
    if (!bill)
        throw new Error("Bill not found");
    if (bill.status === "PAID")
        throw new Error("Bill is already paid");
    const property = bill.contract.room.property;
    return {
        billId: bill.id,
        propertyName: property.name,
        billingPeriod: formatBillingPeriod(bill.month, bill.year),
        total: bill.total,
        paymentQrUrl: property.paymentQrUrl,
        bankName: property.bankName,
        bankAccount: property.bankAccount,
        bankHolder: property.bankHolder,
        items: bill.items.map((i) => ({ title: i.title, amount: i.amount })),
    };
};
exports.getBillPaymentInfo = getBillPaymentInfo;
// 3. ดึงข้อมูลครบสำหรับ PDF
const getBillDetail = async (billId, userId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const bill = await repo.getBillDetailById(billId, userId);
    if (!bill)
        throw new Error("Bill not found");
    const property = bill.contract.room.property;
    const [meter, prevMeter] = await Promise.all([
        repo.getMeterReading(bill.roomId, bill.month, bill.year),
        repo.getPreviousMeterReading(bill.roomId, bill.month, bill.year),
    ]);
    const waterPrev = (_a = prevMeter === null || prevMeter === void 0 ? void 0 : prevMeter.waterMeter) !== null && _a !== void 0 ? _a : 0;
    const waterCurrent = (_b = meter === null || meter === void 0 ? void 0 : meter.waterMeter) !== null && _b !== void 0 ? _b : 0;
    const electricPrev = (_c = prevMeter === null || prevMeter === void 0 ? void 0 : prevMeter.electricMeter) !== null && _c !== void 0 ? _c : 0;
    const electricCurrent = (_d = meter === null || meter === void 0 ? void 0 : meter.electricMeter) !== null && _d !== void 0 ? _d : 0;
    const today = new Date();
    const dateStr = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" }).format(today);
    return {
        billId: bill.id,
        billingPeriod: formatBillingPeriod(bill.month, bill.year),
        property: {
            name: property.name,
            address: (_e = property.address) !== null && _e !== void 0 ? _e : "",
            bankName: (_f = property.bankName) !== null && _f !== void 0 ? _f : "",
            bankAccount: (_g = property.bankAccount) !== null && _g !== void 0 ? _g : "",
            bankHolder: (_h = property.bankHolder) !== null && _h !== void 0 ? _h : "",
            paymentQrUrl: (_j = property.paymentQrUrl) !== null && _j !== void 0 ? _j : null,
            logoUrl: (_k = property.logoUrl) !== null && _k !== void 0 ? _k : null,
            billNote: (_l = property.billNote) !== null && _l !== void 0 ? _l : null,
        },
        roomNumber: bill.room.roomNumber,
        roomTypeName: bill.room.roomType.name,
        tenantName: `${(_o = (_m = bill.user) === null || _m === void 0 ? void 0 : _m.firstName) !== null && _o !== void 0 ? _o : ""} ${(_q = (_p = bill.user) === null || _p === void 0 ? void 0 : _p.lastName) !== null && _q !== void 0 ? _q : ""}`.trim(),
        items: bill.items.map((i) => ({ title: i.title, amount: i.amount })),
        total: bill.total,
        meter: { waterPrev, waterCurrent, electricPrev, electricCurrent },
        dateStr,
        issuerName: (() => {
            var _a, _b;
            const admin = (_b = (_a = property.admins) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.user;
            if (!admin)
                return "";
            return `${admin.firstName} ${admin.lastName}`.trim();
        })(),
    };
};
exports.getBillDetail = getBillDetail;
// 4. ชำระเงิน + อัพโหลดสลิป
const submitPayment = async (billId, userId, data) => {
    if (!data.slipUrl)
        throw new Error("slipUrl is required");
    if (!data.amount || data.amount <= 0)
        throw new Error("amount is required");
    const bill = await repo.getBillById(billId, userId);
    if (!bill)
        throw new Error("Bill not found");
    if (bill.status === "PAID")
        throw new Error("Bill is already paid");
    if (bill.status === "VERIFYING")
        throw new Error("Payment is already submitted and under review");
    const payment = await repo.createPayment({
        userId,
        billId,
        amount: data.amount,
        slipUrl: data.slipUrl,
    });
    // อัพเดท bill → VERIFYING
    await repo.updateBillStatus(billId, "VERIFYING");
    const property = bill.contract.room.property;
    return {
        paymentId: payment.id,
        propertyName: property.name,
        billingPeriod: formatBillingPeriod(bill.month, bill.year),
        amount: payment.amount,
        status: "VERIFYING",
    };
};
exports.submitPayment = submitPayment;
//# sourceMappingURL=billService.js.map