"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomsWithMeter = exports.getMeterReading = exports.upsertMeterReading = exports.getAdminProperties = void 0;
const prisma_1 = require("../../lib/prisma");
// ดึง properties ที่ admin คนนี้ดูแล
const getAdminProperties = async (userId) => {
    return prisma_1.prisma.property.findMany({
        where: {
            admins: { some: { userId } },
        },
        include: {
            images: true,
            rooms: true,
            roomTypes: true,
        },
    });
};
exports.getAdminProperties = getAdminProperties;
// บันทึกมิเตอร์
const upsertMeterReading = async (data) => {
    return prisma_1.prisma.meterReading.upsert({
        where: {
            roomId_month_year: {
                roomId: data.roomId,
                month: data.month,
                year: data.year,
            },
        },
        update: {
            waterMeter: data.waterMeter,
            electricMeter: data.electricMeter,
        },
        create: data,
    });
};
exports.upsertMeterReading = upsertMeterReading;
// ดึงมิเตอร์ของห้องในเดือนนั้น (ถ้ามี)
const getMeterReading = async (roomId, month, year) => {
    return prisma_1.prisma.meterReading.findUnique({
        where: { roomId_month_year: { roomId, month, year } },
    });
};
exports.getMeterReading = getMeterReading;
// ดึงห้องทั้งหมดใน property พร้อมมิเตอร์เดือนล่าสุด
const getRoomsWithMeter = async (propertyId, month, year) => {
    return prisma_1.prisma.room.findMany({
        where: { propertyId },
        include: {
            roomType: true,
            meters: {
                where: { month, year },
                take: 1,
            },
        },
        orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    });
};
exports.getRoomsWithMeter = getRoomsWithMeter;
//# sourceMappingURL=meterRepository.js.map