"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoomPreparing = exports.endContract = exports.getMoveOutBillById = exports.createMoveOutBill = exports.getLatestBill = exports.getPreviousMeterReading = exports.getMeterReading = exports.getContractForMoveOut = exports.getMoveOutBillsByProperty = exports.getMoveOutContracts = void 0;
const prisma_1 = require("../../lib/prisma");
// รายการแจ้งย้ายออก (MOVE_OUT_NOTICE)
const getMoveOutContracts = async (propertyId) => {
    return prisma_1.prisma.contract.findMany({
        where: {
            room: { propertyId },
            status: "MOVE_OUT_NOTICE",
        },
        include: {
            user: true,
            room: { include: { roomType: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getMoveOutContracts = getMoveOutContracts;
// บิลแจ้งออกที่ออกแล้ว
const getMoveOutBillsByProperty = async (propertyId) => {
    return prisma_1.prisma.moveOutBill.findMany({
        where: { room: { propertyId } },
        include: {
            user: true,
            room: { include: { roomType: true } },
            contract: true,
            items: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getMoveOutBillsByProperty = getMoveOutBillsByProperty;
// Contract พร้อม roomType สำหรับคำนวณ
const getContractForMoveOut = async (contractId, propertyId) => {
    return prisma_1.prisma.contract.findFirst({
        where: {
            id: contractId,
            room: { propertyId },
            status: "MOVE_OUT_NOTICE",
        },
        include: {
            user: true,
            room: { include: { roomType: { include: { fees: true } } } },
        },
    });
};
exports.getContractForMoveOut = getContractForMoveOut;
// MeterReading
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
        where: {
            roomId_month_year: { roomId, month: prevMonth, year: prevYear },
        },
    });
};
exports.getPreviousMeterReading = getPreviousMeterReading;
// บิลรายเดือนล่าสุด (สำหรับดึงมิเตอร์เดิม)
const getLatestBill = async (contractId) => {
    return prisma_1.prisma.bill.findFirst({
        where: { contractId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: { items: true },
    });
};
exports.getLatestBill = getLatestBill;
// สร้าง MoveOutBill
const createMoveOutBill = async (data) => {
    return prisma_1.prisma.moveOutBill.create({
        data: {
            contractId: data.contractId,
            roomId: data.roomId,
            userId: data.userId,
            moveOutDate: data.moveOutDate,
            waterStart: data.waterStart,
            waterEnd: data.waterEnd,
            electricStart: data.electricStart,
            electricEnd: data.electricEnd,
            totalCharge: data.totalCharge,
            refundAmount: data.refundAmount,
            status: "CONFIRMED",
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
exports.createMoveOutBill = createMoveOutBill;
// ดูรายละเอียด MoveOutBill
const getMoveOutBillById = async (moveOutBillId, propertyId) => {
    return prisma_1.prisma.moveOutBill.findFirst({
        where: { id: moveOutBillId, room: { propertyId } },
        include: {
            user: true,
            room: { include: { roomType: true, property: true } },
            contract: true,
            items: true,
        },
    });
};
exports.getMoveOutBillById = getMoveOutBillById;
// อัพเดท contract และห้องหลังแจ้งออก
const endContract = async (contractId) => {
    return prisma_1.prisma.contract.update({
        where: { id: contractId },
        data: { status: "ENDED" },
    });
};
exports.endContract = endContract;
const setRoomPreparing = async (roomId) => {
    return prisma_1.prisma.room.update({
        where: { id: roomId },
        data: { status: "PREPARING" },
    });
};
exports.setRoomPreparing = setRoomPreparing;
//# sourceMappingURL=moveOutRepository.js.map