"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaidBillsByMonths = exports.getDashboardData = void 0;
const prisma_1 = require("../../lib/prisma");
const getDashboardData = async (propertyId) => {
    const property = await prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        include: { rooms: true, bookings: true },
    });
    const now = new Date();
    const bills = await prisma_1.prisma.bill.findMany({
        where: { room: { propertyId }, month: now.getMonth() + 1, year: now.getFullYear() },
    });
    return { property, bills };
};
exports.getDashboardData = getDashboardData;
// ดึง Bill PAID ย้อนหลัง 
const getPaidBillsByMonths = async (propertyId, monthsBack) => {
    // คำนวณช่วงเดือนย้อนหลัง
    const now = new Date();
    const ranges = [];
    for (let i = 0; i < monthsBack; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        ranges.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }
    return prisma_1.prisma.bill.findMany({
        where: {
            room: { propertyId },
            status: "PAID",
            OR: ranges.map((r) => ({ month: r.month, year: r.year })),
        },
        select: {
            month: true,
            year: true,
            total: true,
        },
    });
};
exports.getPaidBillsByMonths = getPaidBillsByMonths;
//# sourceMappingURL=dashboardRepository.js.map