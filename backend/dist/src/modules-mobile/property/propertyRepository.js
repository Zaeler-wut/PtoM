"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyById = exports.getAllProperties = void 0;
const prisma_1 = require("../../lib/prisma");
// ดึง property ทั้งหมดพร้อมข้อมูลที่ต้องใช้กรอง
const getAllProperties = async () => {
    return prisma_1.prisma.property.findMany({
        include: {
            images: true,
            facilities: { include: { facility: true } },
            rooms: {
                include: {
                    roomType: true,
                    moveOutBills: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                    contracts: {
                        where: { status: "MOVE_OUT_NOTICE" },
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: { status: true, moveOutNoticeDate: true },
                    },
                },
            },
            roomTypes: {
                include: {
                    images: true,
                    fees: true,
                    facilities: { include: { facility: true } },
                },
            },
        },
    });
};
exports.getAllProperties = getAllProperties;
// ดึง property เดียวสำหรับหน้า detail
const getPropertyById = async (propertyId) => {
    return prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            images: true,
            facilities: { include: { facility: true } },
            rooms: {
                include: {
                    roomType: true,
                    moveOutBills: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                    contracts: {
                        where: { status: "MOVE_OUT_NOTICE" },
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: { status: true, moveOutNoticeDate: true },
                    },
                },
            },
            roomTypes: {
                where: { allowOnlineBooking: true },
                include: {
                    images: true,
                    fees: true,
                    facilities: { include: { facility: true } },
                },
            },
        },
    });
};
exports.getPropertyById = getPropertyById;
//# sourceMappingURL=propertyRepository.js.map