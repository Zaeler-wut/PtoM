"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.updateRoomStatus = exports.updateContractPdf = exports.updateContract = exports.createContract = exports.replaceVehicles = exports.updateUserInfo = exports.createTenantUser = exports.findUserByEmail = exports.findRoomInProperty = exports.checkExistingContract = exports.getContractById = exports.getContractsByProperty = void 0;
const prisma_1 = require("../../lib/prisma");
const getContractsByProperty = async (propertyId) => {
    return prisma_1.prisma.contract.findMany({
        where: { room: { propertyId } },
        include: {
            user: true,
            room: { include: { roomType: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getContractsByProperty = getContractsByProperty;
const getContractById = async (contractId, propertyId) => {
    return prisma_1.prisma.contract.findFirst({
        where: { id: contractId, room: { propertyId } },
        include: {
            user: { include: { vehicles: true } },
            room: { include: { roomType: true } },
        },
    });
};
exports.getContractById = getContractById;
const checkExistingContract = async (bookingId) => {
    return prisma_1.prisma.contract.findUnique({ where: { bookingId } });
};
exports.checkExistingContract = checkExistingContract;
const findRoomInProperty = async (roomId, propertyId) => {
    return prisma_1.prisma.room.findFirst({
        where: { id: roomId, propertyId },
        include: { roomType: true },
    });
};
exports.findRoomInProperty = findRoomInProperty;
const findUserByEmail = async (email) => {
    return prisma_1.prisma.user.findUnique({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const createTenantUser = async (data) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require("bcrypt")));
    const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(2), 12);
    return prisma_1.prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            lineId: data.lineId,
            address: data.address,
            password: tempPassword,
            role: "USER",
        },
    });
};
exports.createTenantUser = createTenantUser;
const updateUserInfo = async (userId, data) => {
    return prisma_1.prisma.user.update({ where: { id: userId }, data });
};
exports.updateUserInfo = updateUserInfo;
const replaceVehicles = async (userId, vehicles) => {
    await prisma_1.prisma.vehicle.deleteMany({ where: { userId } });
    if (vehicles.length === 0)
        return;
    await prisma_1.prisma.vehicle.createMany({
        data: vehicles.map((v) => ({ userId, plateNumber: v.plateNumber, type: v.type })),
    });
};
exports.replaceVehicles = replaceVehicles;
const createContract = async (data) => {
    return prisma_1.prisma.contract.create({
        data: {
            userId: data.userId,
            roomId: data.roomId,
            bookingId: data.bookingId,
            startDate: data.startDate,
            endDate: data.endDate,
            securityDeposit: data.securityDeposit,
            contractType: data.contractType,
            pdfUrl: data.pdfUrl,
            status: "ACTIVE",
        },
    });
};
exports.createContract = createContract;
const updateContract = async (contractId, data) => {
    return prisma_1.prisma.contract.update({
        where: { id: contractId },
        data: {
            status: data.status,
            startDate: data.startDate,
            endDate: data.endDate,
            roomId: data.roomId,
            moveOutNoticeDate: data.moveOutNoticeDate,
        },
    });
};
exports.updateContract = updateContract;
const updateContractPdf = async (contractId, pdfUrl) => {
    return prisma_1.prisma.contract.update({
        where: { id: contractId },
        data: { pdfUrl },
    });
};
exports.updateContractPdf = updateContractPdf;
const updateRoomStatus = async (roomId, status = "OCCUPIED") => {
    return prisma_1.prisma.room.update({
        where: { id: roomId },
        data: { status: status },
    });
};
exports.updateRoomStatus = updateRoomStatus;
const updateBookingStatus = async (bookingId) => {
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CHECKED_IN" },
    });
};
exports.updateBookingStatus = updateBookingStatus;
//# sourceMappingURL=contractRepository.js.map