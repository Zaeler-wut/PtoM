"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.getAllProperties = exports.deleteUser = exports.findUserPasswordById = exports.findUserById = exports.resetPassword = exports.setUserStatus = exports.updateAdminLimit = exports.createAdmin = exports.getAllAdmins = exports.getDashboardStats = void 0;
const prisma_1 = require("../../lib/prisma");
// ── Dashboard ────────────────────────────────────────────────
const getDashboardStats = async () => {
    const [totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms] = await Promise.all([
        prisma_1.prisma.user.count({ where: { role: "ADMIN" } }),
        prisma_1.prisma.user.count({ where: { role: "ADMIN", isActive: true } }),
        prisma_1.prisma.user.count({ where: { role: "USER" } }),
        prisma_1.prisma.property.count(),
        prisma_1.prisma.room.count(),
    ]);
    const newThisMonth = await prisma_1.prisma.user.count({
        where: {
            role: "ADMIN",
            createdAt: { gte: new Date(new Date().setDate(1)) },
        },
    });
    return { totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms, newThisMonth };
};
exports.getDashboardStats = getDashboardStats;
// ── Admins ───────────────────────────────────────────────────
const getAllAdmins = async () => {
    return prisma_1.prisma.user.findMany({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            adminLimit: { select: { propertyLimit: true } },
            managedProperties: {
                select: { property: { select: { id: true, name: true } } },
            },
        },
    });
};
exports.getAllAdmins = getAllAdmins;
const createAdmin = async (data) => {
    return prisma_1.prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: "ADMIN",
            adminLimit: {
                create: { propertyLimit: data.propertyLimit },
            },
        },
        select: {
            id: true, firstName: true, lastName: true,
            email: true, isActive: true, createdAt: true,
            adminLimit: { select: { propertyLimit: true } },
        },
    });
};
exports.createAdmin = createAdmin;
const updateAdminLimit = async (userId, propertyLimit) => {
    return prisma_1.prisma.adminLimit.upsert({
        where: { userId },
        update: { propertyLimit },
        create: { userId, propertyLimit },
    });
};
exports.updateAdminLimit = updateAdminLimit;
const setUserStatus = async (userId, isActive) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: { id: true, isActive: true },
    });
};
exports.setUserStatus = setUserStatus;
const resetPassword = async (userId, hashedPassword) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
};
exports.resetPassword = resetPassword;
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true, isActive: true, email: true },
    });
};
exports.findUserById = findUserById;
const findUserPasswordById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: { id: true, password: true },
    });
};
exports.findUserPasswordById = findUserPasswordById;
const deleteUser = async (id) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const bills = await tx.bill.findMany({ where: { userId: id }, select: { id: true } });
        const billIds = bills.map(b => b.id);
        const moveOutBills = await tx.moveOutBill.findMany({ where: { userId: id }, select: { id: true } });
        const moveOutBillIds = moveOutBills.map(b => b.id);
        await tx.payment.deleteMany({ where: { userId: id } });
        await tx.billItem.deleteMany({ where: { billId: { in: billIds } } });
        await tx.bill.deleteMany({ where: { userId: id } });
        await tx.moveOutBillItem.deleteMany({ where: { moveOutBillId: { in: moveOutBillIds } } });
        await tx.moveOutBill.deleteMany({ where: { userId: id } });
        await tx.contract.deleteMany({ where: { userId: id } });
        await tx.booking.deleteMany({ where: { userId: id } });
        await tx.vehicle.deleteMany({ where: { userId: id } });
        await tx.refreshToken.deleteMany({ where: { userId: id } });
        await tx.adminLimit.deleteMany({ where: { userId: id } });
        await tx.propertyAdmin.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
    });
};
exports.deleteUser = deleteUser;
// ── Properties ───────────────────────────────────────────────
const getAllProperties = async () => {
    return prisma_1.prisma.property.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
            rooms: { select: { id: true } },
            admins: {
                select: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            },
        },
    });
};
exports.getAllProperties = getAllProperties;
// ── Users (Support) ──────────────────────────────────────────
const searchUsers = async (q) => {
    return prisma_1.prisma.user.findMany({
        where: {
            role: "USER",
            OR: [
                { email: { contains: q, mode: "insensitive" } },
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
            ],
        },
        select: {
            id: true, firstName: true, lastName: true,
            email: true, isActive: true, createdAt: true, lastLogin: true,
        },
        take: 30,
    });
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=superadminRepository.js.map