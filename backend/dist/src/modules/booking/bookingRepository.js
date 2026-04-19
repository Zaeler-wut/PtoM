"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseRoom = exports.cancelBooking = exports.confirmBooking = exports.getPropertyPreparingDays = exports.reserveRoom = exports.assignRoomToBooking = exports.getAvailableRoomsForDate = exports.getBookingForContract = exports.getBookingDetail = exports.getBookingsByProperty = void 0;
const prisma_1 = require("../../lib/prisma");
const getBookingsByProperty = async (propertyId) => {
    return prisma_1.prisma.booking.findMany({
        where: { propertyId },
        include: {
            user: {
                include: {
                    contracts: { where: { room: { propertyId } }, select: { id: true, roomId: true, bookingId: true } },
                },
            },
            roomType: true,
            room: true,
            contract: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getBookingsByProperty = getBookingsByProperty;
const getBookingDetail = async (bookingId, propertyId) => {
    return prisma_1.prisma.booking.findFirst({
        where: { id: bookingId, propertyId },
        include: { user: true, roomType: true, room: true },
    });
};
exports.getBookingDetail = getBookingDetail;
const getBookingForContract = async (bookingId, propertyId) => {
    return prisma_1.prisma.booking.findFirst({
        where: { id: bookingId, propertyId, status: "CONFIRMED" },
        include: {
            user: { include: { vehicles: true } },
            roomType: true,
            room: true,
        },
    });
};
exports.getBookingForContract = getBookingForContract;
// ดึงห้องที่ว่างได้ ณ วันที่ moveInDate
// Priority: PREPARING ที่พร้อมก่อน moveInDate → AVAILABLE
const getAvailableRoomsForDate = async (propertyId, roomTypeId, moveInDate, preparingDays) => {
    const availableRooms = await prisma_1.prisma.room.findMany({
        where: { propertyId, roomTypeId, status: "AVAILABLE" },
    });
    // PREPARING: ออกไปแล้ว รอทำความสะอาด
    const preparingRooms = await prisma_1.prisma.room.findMany({
        where: { propertyId, roomTypeId, status: "PREPARING" },
        include: {
            moveOutBills: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });
    const readyPreparingRooms = preparingRooms.filter((room) => {
        const latestMoveOut = room.moveOutBills[0];
        // ไม่มี moveOutBill = admin ตั้งสถานะเองว่าเตรียมว่าง → พร้อมจองได้เลย
        if (!latestMoveOut)
            return true;
        const readyDate = new Date(latestMoveOut.moveOutDate);
        readyDate.setDate(readyDate.getDate() + preparingDays);
        return readyDate <= moveInDate;
    });
    // OCCUPIED ที่แจ้งออกแล้ว (MOVE_OUT_NOTICE) — พร้อมหลัง moveOutNoticeDate + preparingDays
    const occupiedWithNotice = await prisma_1.prisma.room.findMany({
        where: { propertyId, roomTypeId, status: "OCCUPIED" },
        include: {
            contracts: {
                where: { status: "MOVE_OUT_NOTICE" },
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { moveOutNoticeDate: true },
            },
        },
    });
    const readyNoticeRooms = occupiedWithNotice.filter((room) => {
        const contract = room.contracts[0];
        if (!(contract === null || contract === void 0 ? void 0 : contract.moveOutNoticeDate))
            return false;
        const readyDate = new Date(contract.moveOutNoticeDate);
        readyDate.setDate(readyDate.getDate() + preparingDays);
        return readyDate <= moveInDate;
    });
    return {
        availableRooms,
        preparingRooms: [...readyPreparingRooms, ...readyNoticeRooms],
    };
};
exports.getAvailableRoomsForDate = getAvailableRoomsForDate;
const assignRoomToBooking = async (bookingId, roomId) => {
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { roomId, assignedAt: new Date(), status: "CONFIRMED" },
    });
};
exports.assignRoomToBooking = assignRoomToBooking;
const reserveRoom = async (roomId) => {
    return prisma_1.prisma.room.update({
        where: { id: roomId },
        data: { status: "RESERVED" },
    });
};
exports.reserveRoom = reserveRoom;
const getPropertyPreparingDays = async (propertyId) => {
    var _a;
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        select: { preparingDays: true },
    });
    return (_a = property === null || property === void 0 ? void 0 : property.preparingDays) !== null && _a !== void 0 ? _a : 3;
};
exports.getPropertyPreparingDays = getPropertyPreparingDays;
const confirmBooking = async (bookingId) => {
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
    });
};
exports.confirmBooking = confirmBooking;
const cancelBooking = async (bookingId) => {
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
    });
};
exports.cancelBooking = cancelBooking;
const releaseRoom = async (roomId) => {
    return prisma_1.prisma.room.update({
        where: { id: roomId },
        data: { status: "AVAILABLE" },
    });
};
exports.releaseRoom = releaseRoom;
//# sourceMappingURL=bookingRepository.js.map