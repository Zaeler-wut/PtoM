"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = exports.getMeterHistory = exports.updateRoom = exports.getRoomByNumberInProperty = exports.getRoomById = exports.getRoomsByProperty = void 0;
const prisma_1 = require("../../lib/prisma");
const getRoomsByProperty = async (propertyId) => {
    var _a;
    const [rooms, property] = await Promise.all([
        prisma_1.prisma.room.findMany({
            where: { propertyId },
            include: {
                roomType: true,
                contracts: {
                    where: { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } },
                    include: { user: true },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                moveOutBills: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { moveOutDate: true },
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
exports.getRoomsByProperty = getRoomsByProperty;
const getRoomById = async (roomId) => {
    return prisma_1.prisma.room.findUnique({ where: { id: roomId } });
};
exports.getRoomById = getRoomById;
const getRoomByNumberInProperty = async (propertyId, roomNumber) => {
    return prisma_1.prisma.room.findFirst({ where: { propertyId, roomNumber } });
};
exports.getRoomByNumberInProperty = getRoomByNumberInProperty;
const updateRoom = async (roomId, data) => {
    return prisma_1.prisma.room.update({
        where: { id: roomId },
        data: {
            roomNumber: data.roomNumber,
            roomTypeId: data.roomTypeId,
            floor: data.floor,
            status: data.status,
        },
    });
};
exports.updateRoom = updateRoom;
const getMeterHistory = async (roomId, propertyId) => {
    // ตรวจสอบว่า room อยู่ใน property นี้
    const room = await prisma_1.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room)
        return null;
    return prisma_1.prisma.meterReading.findMany({
        where: { roomId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
};
exports.getMeterHistory = getMeterHistory;
const createRoom = async (data) => {
    var _a;
    return prisma_1.prisma.room.create({
        data: {
            propertyId: data.propertyId,
            roomTypeId: data.roomTypeId,
            roomNumber: data.roomNumber,
            floor: (_a = data.floor) !== null && _a !== void 0 ? _a : null,
            status: "AVAILABLE",
        },
    });
};
exports.createRoom = createRoom;
//# sourceMappingURL=roomRepository.js.map