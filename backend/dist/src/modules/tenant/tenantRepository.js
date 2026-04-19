"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserInfo = exports.replaceVehicles = exports.getTenantDetail = exports.getTenantsByProperty = void 0;
const prisma_1 = require("../../lib/prisma");
const getTenantsByProperty = async (propertyId) => {
    return prisma_1.prisma.contract.findMany({
        where: {
            room: { propertyId },
            status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] },
        },
        include: {
            user: true,
            room: { include: { roomType: true } },
        },
        orderBy: { startDate: "desc" },
    });
};
exports.getTenantsByProperty = getTenantsByProperty;
const getTenantDetail = async (contractId, propertyId) => {
    return prisma_1.prisma.contract.findFirst({
        where: { id: contractId, room: { propertyId } },
        include: {
            user: { include: { vehicles: true } },
            room: { include: { roomType: true } },
        },
    });
};
exports.getTenantDetail = getTenantDetail;
const replaceVehicles = async (userId, vehicles) => {
    await prisma_1.prisma.vehicle.deleteMany({ where: { userId } });
    if (vehicles.length === 0)
        return;
    await prisma_1.prisma.vehicle.createMany({
        data: vehicles.map((v) => ({ userId, plateNumber: v.plateNumber, type: v.type })),
    });
};
exports.replaceVehicles = replaceVehicles;
const updateUserInfo = async (userId, data) => {
    var _a, _b;
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: (_a = data.phone) !== null && _a !== void 0 ? _a : null,
            lineId: (_b = data.lineId) !== null && _b !== void 0 ? _b : null,
        },
    });
};
exports.updateUserInfo = updateUserInfo;
//# sourceMappingURL=tenantRepository.js.map