"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyContracts = void 0;
const prisma_1 = require("../../lib/prisma");
const getMyContracts = async (userId) => {
    return prisma_1.prisma.contract.findMany({
        where: { userId },
        include: {
            room: {
                include: {
                    property: { select: { name: true } },
                },
            },
        },
        orderBy: { startDate: "desc" },
    });
};
exports.getMyContracts = getMyContracts;
//# sourceMappingURL=contractRepository.js.map