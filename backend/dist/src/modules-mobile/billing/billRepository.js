"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBillStatus = exports.createPayment = exports.getPreviousMeterReading = exports.getMeterReading = exports.getBillDetailById = exports.getBillById = exports.getBillsByUser = void 0;
const prisma_1 = require("../../lib/prisma");
// ดึงบิลทั้งหมดของ user
const getBillsByUser = async (userId) => {
    return prisma_1.prisma.bill.findMany({
        where: {
            userId,
            status: { in: ["PENDING", "VERIFYING", "PAID"] },
        },
        include: {
            items: true,
            user: { select: { firstName: true, lastName: true } },
            payments: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
            room: {
                include: { roomType: true },
            },
            contract: {
                include: {
                    room: {
                        include: {
                            property: {
                                select: {
                                    name: true,
                                    bankName: true,
                                    bankAccount: true,
                                    bankHolder: true,
                                    paymentQrUrl: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
};
exports.getBillsByUser = getBillsByUser;
// ดึงบิลเดียวสำหรับหน้าชำระเงิน
const getBillById = async (billId, userId) => {
    return prisma_1.prisma.bill.findFirst({
        where: { id: billId, userId },
        include: {
            items: true,
            room: true,
            contract: {
                include: {
                    room: {
                        include: {
                            property: {
                                select: {
                                    name: true,
                                    bankName: true,
                                    bankAccount: true,
                                    bankHolder: true,
                                    paymentQrUrl: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
exports.getBillById = getBillById;
// ดึงบิลพร้อมข้อมูลครบสำหรับ PDF
const getBillDetailById = async (billId, userId) => {
    return prisma_1.prisma.bill.findFirst({
        where: { id: billId, userId },
        include: {
            items: true,
            user: { select: { firstName: true, lastName: true } },
            room: { include: { roomType: { select: { name: true } } } },
            contract: {
                include: {
                    room: {
                        include: {
                            property: {
                                select: {
                                    name: true, address: true,
                                    bankName: true, bankAccount: true, bankHolder: true,
                                    paymentQrUrl: true, logoUrl: true, billNote: true,
                                    admins: {
                                        take: 1,
                                        include: { user: { select: { firstName: true, lastName: true } } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
exports.getBillDetailById = getBillDetailById;
const getMeterReading = async (roomId, month, year) => {
    return prisma_1.prisma.meterReading.findUnique({
        where: { roomId_month_year: { roomId, month, year } },
    });
};
exports.getMeterReading = getMeterReading;
const getPreviousMeterReading = async (roomId, month, year) => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return prisma_1.prisma.meterReading.findUnique({
        where: { roomId_month_year: { roomId, month: prevMonth, year: prevYear } },
    });
};
exports.getPreviousMeterReading = getPreviousMeterReading;
// สร้าง payment
const createPayment = async (data) => {
    return prisma_1.prisma.payment.create({
        data: {
            userId: data.userId,
            billId: data.billId,
            amount: data.amount,
            slipUrl: data.slipUrl,
            status: "VERIFYING",
        },
    });
};
exports.createPayment = createPayment;
// อัพเดท bill status  VERIFYING
const updateBillStatus = async (billId, status) => {
    return prisma_1.prisma.bill.update({
        where: { id: billId },
        data: { status: status },
    });
};
exports.updateBillStatus = updateBillStatus;
//# sourceMappingURL=billRepository.js.map