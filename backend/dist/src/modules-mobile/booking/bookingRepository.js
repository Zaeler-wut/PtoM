"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyBookings = exports.getRoomsForAvailabilityCheck = exports.releaseRoom = exports.cancelBooking = exports.getBookingById = exports.createBooking = exports.getBookingInfo = exports.getContractsByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const getContractsByUser = async (userId) => {
    return prisma_1.prisma.contract.findMany({
        where: { userId },
        select: { id: true, roomId: true, bookingId: true },
    });
};
exports.getContractsByUser = getContractsByUser;
// ดึงข้อมูลสำหรับหน้าจอง
const getBookingInfo = async (propertyId, roomTypeId) => {
    return prisma_1.prisma.roomType.findFirst({
        where: { id: roomTypeId, propertyId, allowOnlineBooking: true },
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
    });
};
exports.getBookingInfo = getBookingInfo;
// สร้าง booking พร้อม smart room selection
const createBooking = async (data) => {
    // สร้าง booking โดยยังไม่ assign ห้อง — admin จะ assign ตอน confirm
    const booking = await prisma_1.prisma.booking.create({
        data: {
            propertyId: data.propertyId,
            roomTypeId: data.roomTypeId,
            userId: data.userId,
            moveInDate: data.moveInDate,
            bookingFee: data.bookingFee,
            slipUrl: data.slipUrl,
            status: "PENDING",
        },
    });
    return booking;
};
exports.createBooking = createBooking;
// ดึง booking พร้อม property และ roomType
const getBookingById = async (bookingId) => {
    return prisma_1.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            property: { select: { name: true } },
            roomType: { select: { name: true, roomPrice: true, bookingFee: true } },
            user: { select: { firstName: true, lastName: true } },
        },
    });
};
exports.getBookingById = getBookingById;
// ยกเลิก booking
const cancelBooking = async (bookingId) => {
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
    });
};
exports.cancelBooking = cancelBooking;
// คืน room status → AVAILABLE ถ้ามีการ assign แล้ว
const releaseRoom = async (roomId) => {
    return prisma_1.prisma.room.update({
        where: { id: roomId },
        data: { status: "AVAILABLE" },
    });
};
exports.releaseRoom = releaseRoom;
// ดึง rooms พร้อม preparingDays เพื่อคำนวณ minMoveInDate
const getRoomsForAvailabilityCheck = async (propertyId, roomTypeId) => {
    var _a;
    const [rooms, property] = await Promise.all([
        prisma_1.prisma.room.findMany({
            where: { propertyId, roomTypeId },
            include: {
                moveOutBills: { orderBy: { createdAt: "desc" }, take: 1, select: { moveOutDate: true } },
                contracts: {
                    where: { status: "MOVE_OUT_NOTICE" },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { moveOutNoticeDate: true },
                },
            },
        }),
        prisma_1.prisma.property.findUnique({
            where: { id: propertyId },
            select: { preparingDays: true },
        }),
    ]);
    return { rooms, preparingDays: (_a = property === null || property === void 0 ? void 0 : property.preparingDays) !== null && _a !== void 0 ? _a : 3 };
};
exports.getRoomsForAvailabilityCheck = getRoomsForAvailabilityCheck;
// ดึงการจองทั้งหมดของ user
const getMyBookings = async (userId) => {
    return prisma_1.prisma.booking.findMany({
        where: { userId },
        include: {
            property: { select: { name: true } },
            roomType: { select: { id: true, name: true, roomPrice: true } },
            room: { select: { roomNumber: true } },
            user: { select: { firstName: true, lastName: true } },
            contract: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getMyBookings = getMyBookings;
//# sourceMappingURL=bookingRepository.js.map