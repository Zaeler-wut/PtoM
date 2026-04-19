"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const prisma_1 = require("../../lib/prisma");
// ดึงข้อมูล user พร้อม contract active และบิล
const getUserProfile = async (userId) => {
    return prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            // สัญญา active ล่าสุด
            contracts: {
                where: { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } },
                include: {
                    room: {
                        include: {
                            property: { select: { name: true } },
                            roomType: {
                                select: {
                                    name: true,
                                    roomPrice: true,
                                    furniturePrice: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { startDate: "desc" },
                take: 1,
            },
            // สรุปบิล
            bills: {
                where: {
                    status: { in: ["PENDING", "VERIFYING", "PAID"] },
                },
                select: { status: true },
            },
        },
    });
};
exports.getUserProfile = getUserProfile;
// อัพเดทข้อมูลส่วนตัว
const updateUserProfile = async (userId, data) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    });
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=profileRepository.js.map