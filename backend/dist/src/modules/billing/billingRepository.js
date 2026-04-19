"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableBillingMonths = exports.getPropertyForInvoice = exports.updatePaymentConfirmed = exports.updatePaymentStatus = exports.getPaymentById = exports.getPendingBillsWithoutPayment = exports.getPaymentsByProperty = exports.updateBillPdf = exports.updateBillStatus = exports.createPaymentForBill = exports.createBill = exports.getBillsByProperty = exports.getBillByContract = exports.upsertMeterReading = exports.getPreviousMeterReading = exports.getMeterReading = exports.getContractsByPropertyForMonth = exports.getActiveContractsByProperty = void 0;
const prisma_1 = require("../../lib/prisma");
// ดึงสัญญา active ในเดือนนั้นๆ (สำหรับ sendAll ที่ต้องการเฉพาะปัจจุบัน)
const getActiveContractsByProperty = async (propertyId) => {
    return prisma_1.prisma.contract.findMany({
        where: {
            room: { propertyId },
            status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] },
        },
        include: {
            user: true,
            room: { include: { roomType: { include: { fees: true } } } },
        },
    });
};
exports.getActiveContractsByProperty = getActiveContractsByProperty;
// ดึงสัญญาที่ overlap กับเดือน/ปีที่ระบุ
// activeOnly=true  เฉพาะ ACTIVE/MOVE_OUT_NOTICE (ใช้กับเดือนปัจจุบัน)
// activeOnly=false  รวม ENDED ด้วย (ใช้กับเดือนที่ผ่านมา เพื่อแสดงบิลย้อนหลัง)
const getContractsByPropertyForMonth = async (propertyId, month, year, activeOnly) => {
    const monthStart = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthEnd = new Date(year, month - 1, daysInMonth, 23, 59, 59);
    return prisma_1.prisma.contract.findMany({
        where: {
            room: { propertyId },
            startDate: { lte: monthEnd },
            endDate: { gte: monthStart },
            ...(activeOnly ? { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } } : {}),
        },
        include: {
            user: true,
            room: { include: { roomType: { include: { fees: true } } } },
            moveOutBills: { select: { id: true }, orderBy: { createdAt: "desc" }, take: 1 },
        },
    });
};
exports.getContractsByPropertyForMonth = getContractsByPropertyForMonth;
// ดึงข้อมูล มิเตอร์ที่อ่านได้
const getMeterReading = async (roomId, month, year) => {
    return prisma_1.prisma.meterReading.findUnique({
        where: { roomId_month_year: { roomId, month, year } },
        include: { images: true },
    });
};
exports.getMeterReading = getMeterReading;
// มิเตอร์เดือนก่อนหน้า
const getPreviousMeterReading = async (roomId, month, year) => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return prisma_1.prisma.meterReading.findUnique({
        where: { roomId_month_year: { roomId, month: prevMonth, year: prevYear } },
    });
};
exports.getPreviousMeterReading = getPreviousMeterReading;
const upsertMeterReading = async (roomId, month, year, data) => {
    return prisma_1.prisma.meterReading.upsert({
        where: { roomId_month_year: { roomId, month, year } },
        update: {
            waterMeter: data.waterMeter,
            electricMeter: data.electricMeter,
        },
        create: {
            roomId,
            month,
            year,
            waterMeter: data.waterMeter,
            electricMeter: data.electricMeter,
        },
    });
};
exports.upsertMeterReading = upsertMeterReading;
// บิล
const getBillByContract = async (contractId, month, year) => {
    return prisma_1.prisma.bill.findFirst({
        where: { contractId, month, year },
        include: { items: true, payments: true },
    });
};
exports.getBillByContract = getBillByContract;
const getBillsByProperty = async (propertyId, month, year) => {
    return prisma_1.prisma.bill.findMany({
        where: {
            month,
            year,
            room: { propertyId },
        },
        include: {
            items: true,
            payments: true,
            user: true,
            room: { include: { roomType: true } },
            contract: true,
        },
    });
};
exports.getBillsByProperty = getBillsByProperty;
const createBill = async (data) => {
    return prisma_1.prisma.bill.create({
        data: {
            contractId: data.contractId,
            roomId: data.roomId,
            userId: data.userId,
            month: data.month,
            year: data.year,
            roomRent: data.roomRent,
            furnitureRent: data.furnitureRent,
            total: data.total,
            status: "PENDING",
            items: {
                create: data.items.map((item) => ({
                    title: item.title,
                    amount: item.amount,
                })),
            },
        },
        include: { items: true },
    });
};
exports.createBill = createBill;
const createPaymentForBill = async (data) => {
    var _a;
    return prisma_1.prisma.payment.create({
        data: {
            billId: data.billId,
            userId: data.userId,
            amount: data.amount,
            slipUrl: (_a = data.slipUrl) !== null && _a !== void 0 ? _a : null,
            status: "VERIFYING",
        },
    });
};
exports.createPaymentForBill = createPaymentForBill;
const updateBillStatus = async (billId, status) => {
    return prisma_1.prisma.bill.update({
        where: { id: billId },
        data: { status: status },
    });
};
exports.updateBillStatus = updateBillStatus;
const updateBillPdf = async (billId, pdfUrl) => {
    return prisma_1.prisma.bill.update({
        where: { id: billId },
        data: { pdfUrl },
    });
};
exports.updateBillPdf = updateBillPdf;
// จ่ายเงิน
const getPaymentsByProperty = async (propertyId, month, year) => {
    return prisma_1.prisma.payment.findMany({
        where: {
            bill: {
                month,
                year,
                room: { propertyId },
            },
        },
        include: {
            user: true,
            bill: {
                include: {
                    room: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getPaymentsByProperty = getPaymentsByProperty;
// บิลที่ส่งแล้ว (PENDING) แต่ยังไม่มีการชำระเงิน
const getPendingBillsWithoutPayment = async (propertyId, month, year) => {
    return prisma_1.prisma.bill.findMany({
        where: {
            month,
            year,
            room: { propertyId },
            status: "PENDING",
            payments: { none: {} },
        },
        include: {
            user: true,
            room: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getPendingBillsWithoutPayment = getPendingBillsWithoutPayment;
const getPaymentById = async (paymentId) => {
    return prisma_1.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            user: true,
            bill: {
                include: { room: { include: { roomType: true } } },
            },
        },
    });
};
exports.getPaymentById = getPaymentById;
const updatePaymentStatus = async (paymentId, status) => {
    return prisma_1.prisma.payment.update({
        where: { id: paymentId },
        data: { status: status },
    });
};
exports.updatePaymentStatus = updatePaymentStatus;
const updatePaymentConfirmed = async (paymentId, verifiedBy) => {
    return prisma_1.prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: "CONFIRMED",
            verifiedAt: new Date(),
            verifiedBy,
        },
    });
};
exports.updatePaymentConfirmed = updatePaymentConfirmed;
// ใบแจ้งหนี้
const getPropertyForInvoice = async (propertyId) => {
    return prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        select: {
            name: true,
            address: true,
            bankName: true,
            bankAccount: true,
            bankHolder: true,
            paymentQrUrl: true,
            logoUrl: true,
            billNote: true,
        },
    });
};
exports.getPropertyForInvoice = getPropertyForInvoice;
const getAvailableBillingMonths = async (propertyId) => {
    const rows = await prisma_1.prisma.bill.findMany({
        where: { room: { propertyId } },
        select: { month: true, year: true },
        distinct: ["month", "year"],
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return rows;
};
exports.getAvailableBillingMonths = getAvailableBillingMonths;
//# sourceMappingURL=billingRepository.js.map