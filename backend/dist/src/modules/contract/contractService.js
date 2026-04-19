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
exports.createOfflineContract = exports.createOnlineContract = exports.updateContract = exports.uploadContractPdf = exports.getContractDetail = exports.getContracts = void 0;
const repo = __importStar(require("./contractRepository"));
// HELPERS
function buildAddress(data) {
    return [
        data.houseNumber,
        data.soi ? `ซ.${data.soi}` : null,
        data.road ? `ถ.${data.road}` : null,
        data.subDistrict,
        data.district,
        data.province,
    ]
        .filter(Boolean)
        .join(" ");
}
function validateContractData(data) {
    var _a, _b, _c;
    if (!((_a = data.firstName) === null || _a === void 0 ? void 0 : _a.trim()))
        throw new Error("firstName is required");
    if (!((_b = data.lastName) === null || _b === void 0 ? void 0 : _b.trim()))
        throw new Error("lastName is required");
    if (!((_c = data.email) === null || _c === void 0 ? void 0 : _c.trim()))
        throw new Error("email is required");
    if (!data.roomId)
        throw new Error("roomId is required");
    if (!data.startDate)
        throw new Error("startDate is required");
    if (!data.endDate)
        throw new Error("endDate is required");
    if (data.securityDeposit === undefined)
        throw new Error("securityDeposit is required");
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (isNaN(startDate.getTime()))
        throw new Error("startDate is invalid");
    if (isNaN(endDate.getTime()))
        throw new Error("endDate is invalid");
    if (endDate <= startDate)
        throw new Error("endDate must be after startDate");
    return { startDate, endDate };
}
async function resolveUser(data) {
    const email = data.email.trim().toLowerCase();
    let user = await repo.findUserByEmail(email);
    if (user) {
        await repo.updateUserInfo(user.id, {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone,
            email,
            lineId: data.lineId,
            address: data.address,
        });
    }
    else {
        user = await repo.createTenantUser({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email,
            phone: data.phone,
            lineId: data.lineId,
            address: data.address,
        });
    }
    return user;
}
// CONTRACT LIST / DETAIL
const getContracts = async (propertyId) => {
    const contracts = await repo.getContractsByProperty(propertyId);
    return contracts.map((c) => {
        const months = Math.round((c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return {
            contractId: c.id,
            firstName: c.user.firstName,
            lastName: c.user.lastName,
            roomNumber: c.room.roomNumber,
            contractType: c.contractType,
            status: c.status,
            startDate: c.startDate,
            endDate: c.endDate,
            duration: `${months} เดือน`,
            pdfUrl: c.pdfUrl,
        };
    });
};
exports.getContracts = getContracts;
const getContractDetail = async (contractId, propertyId) => {
    var _a;
    const c = await repo.getContractById(contractId, propertyId);
    if (!c)
        throw new Error("Contract not found");
    const months = Math.round((c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const rt = c.room.roomType;
    return {
        contractId: c.id,
        contractType: c.contractType,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        createdAt: c.createdAt,
        moveOutNoticeDate: (_a = c.moveOutNoticeDate) !== null && _a !== void 0 ? _a : null,
        duration: `${months} เดือน`,
        pdfUrl: c.pdfUrl,
        user: {
            id: c.user.id,
            firstName: c.user.firstName,
            lastName: c.user.lastName,
            email: c.user.email,
            phone: c.user.phone,
            lineId: c.user.lineId,
            address: c.user.address,
        },
        room: {
            roomId: c.room.id,
            roomNumber: c.room.roomNumber,
            roomType: rt.name,
            roomPrice: rt.roomPrice,
        },
        vehicles: c.user.vehicles.map((v) => ({
            plateNumber: v.plateNumber,
            type: v.type,
        })),
        financial: {
            securityDeposit: c.securityDeposit,
            advanceRent: rt.advanceRent,
            waterRate: rt.waterRate,
            electricRate: rt.electricRate,
            furniturePrice: rt.furniturePrice,
        },
    };
};
exports.getContractDetail = getContractDetail;
const uploadContractPdf = async (contractId, propertyId, pdfUrl) => {
    const c = await repo.getContractById(contractId, propertyId);
    if (!c)
        throw new Error("Contract not found");
    if (!pdfUrl)
        throw new Error("pdfUrl is required");
    return repo.updateContractPdf(contractId, pdfUrl);
};
exports.uploadContractPdf = uploadContractPdf;
const updateContract = async (contractId, propertyId, data) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const c = await repo.getContractById(contractId, propertyId);
    if (!c)
        throw new Error("Contract not found");
    if (data.status) {
        const isStatusChanging = data.status !== c.status;
        if (isStatusChanging) {
            const allowedTransitions = {
                ACTIVE: ["MOVE_OUT_NOTICE", "ENDED"],
                MOVE_OUT_NOTICE: ["ACTIVE", "ENDED"],
                ENDED: [],
            };
            if (!((_a = allowedTransitions[c.status]) === null || _a === void 0 ? void 0 : _a.includes(data.status))) {
                throw new Error(`Cannot change status from ${c.status} to ${data.status}`);
            }
            if (data.status === "MOVE_OUT_NOTICE" && !data.moveOutNoticeDate) {
                throw new Error("moveOutNoticeDate is required when status is MOVE_OUT_NOTICE");
            }
        }
    }
    let startDate;
    let endDate;
    if (data.startDate) {
        startDate = new Date(data.startDate);
        if (isNaN(startDate.getTime()))
            throw new Error("startDate is invalid");
    }
    if (data.endDate) {
        endDate = new Date(data.endDate);
        if (isNaN(endDate.getTime()))
            throw new Error("endDate is invalid");
    }
    if (startDate && endDate && endDate <= startDate) {
        throw new Error("endDate must be after startDate");
    }
    await repo.updateUserInfo(c.userId, {
        firstName: (_c = (_b = data.firstName) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : c.user.firstName,
        lastName: (_e = (_d = data.lastName) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : c.user.lastName,
        email: (_g = (_f = data.email) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : c.user.email,
        phone: (_k = (_j = (_h = data.phone) === null || _h === void 0 ? void 0 : _h.trim()) !== null && _j !== void 0 ? _j : c.user.phone) !== null && _k !== void 0 ? _k : undefined,
        lineId: (_o = (_m = (_l = data.lineId) === null || _l === void 0 ? void 0 : _l.trim()) !== null && _m !== void 0 ? _m : c.user.lineId) !== null && _o !== void 0 ? _o : undefined,
        address: (_r = (_q = (_p = data.address) === null || _p === void 0 ? void 0 : _p.trim()) !== null && _q !== void 0 ? _q : c.user.address) !== null && _r !== void 0 ? _r : undefined,
    });
    if (Array.isArray(data.vehicles)) {
        await repo.replaceVehicles(c.userId, data.vehicles);
    }
    if (data.roomId && data.roomId !== c.roomId) {
        const newRoom = await repo.findRoomInProperty(data.roomId, propertyId);
        if (!newRoom)
            throw new Error("New room not found in this property");
        if (newRoom.status === "OCCUPIED")
            throw new Error("New room is already occupied");
        await repo.updateRoomStatus(c.roomId, "AVAILABLE");
        await repo.updateRoomStatus(data.roomId, "OCCUPIED");
    }
    if (data.status === "ENDED") {
        await repo.updateRoomStatus(c.roomId, "AVAILABLE");
    }
    const moveOutNoticeDate = data.moveOutNoticeDate
        ? new Date(data.moveOutNoticeDate)
        : undefined;
    const updated = await repo.updateContract(contractId, {
        status: data.status,
        startDate,
        endDate,
        roomId: data.roomId,
        moveOutNoticeDate,
    });
    return {
        contractId: updated.id,
        status: updated.status,
        startDate: updated.startDate,
        endDate: updated.endDate,
        roomId: updated.roomId,
    };
};
exports.updateContract = updateContract;
// CREATE CONTRACT
const createOnlineContract = async (propertyId, data) => {
    const { startDate, endDate } = validateContractData(data);
    const room = await repo.findRoomInProperty(data.roomId, propertyId);
    if (!room)
        throw new Error("Room not found in this property");
    if (room.status === "OCCUPIED")
        throw new Error("Room is already occupied");
    if (data.bookingId) {
        const existing = await repo.checkExistingContract(data.bookingId);
        if (existing)
            throw new Error("Contract already exists for this booking");
    }
    const address = buildAddress(data);
    const user = await resolveUser({ ...data, address });
    if (Array.isArray(data.vehicles))
        await repo.replaceVehicles(user.id, data.vehicles);
    const contract = await repo.createContract({
        userId: user.id,
        roomId: data.roomId,
        bookingId: data.bookingId,
        startDate,
        endDate,
        securityDeposit: data.securityDeposit,
        contractType: "ONLINE",
        pdfUrl: data.pdfUrl,
    });
    await repo.updateRoomStatus(data.roomId, "OCCUPIED");
    if (data.bookingId)
        await repo.updateBookingStatus(data.bookingId);
    return {
        contractId: contract.id,
        contractType: contract.contractType,
        roomNumber: room.roomNumber,
        roomType: room.roomType.name,
        startDate: contract.startDate,
        endDate: contract.endDate,
        securityDeposit: contract.securityDeposit,
        status: contract.status,
    };
};
exports.createOnlineContract = createOnlineContract;
const createOfflineContract = async (propertyId, data) => {
    const { startDate, endDate } = validateContractData(data);
    const room = await repo.findRoomInProperty(data.roomId, propertyId);
    if (!room)
        throw new Error("Room not found in this property");
    if (room.status === "OCCUPIED")
        throw new Error("Room is already occupied");
    if (data.bookingId) {
        const existing = await repo.checkExistingContract(data.bookingId);
        if (existing)
            throw new Error("Contract already exists for this booking");
    }
    const address = buildAddress(data);
    const user = await resolveUser({ ...data, address });
    if (Array.isArray(data.vehicles))
        await repo.replaceVehicles(user.id, data.vehicles);
    const contract = await repo.createContract({
        userId: user.id,
        roomId: data.roomId,
        bookingId: data.bookingId,
        startDate,
        endDate,
        securityDeposit: data.securityDeposit,
        contractType: "OFFLINE",
        pdfUrl: data.pdfUrl,
    });
    await repo.updateRoomStatus(data.roomId, "OCCUPIED");
    if (data.bookingId)
        await repo.updateBookingStatus(data.bookingId);
    return {
        contractId: contract.id,
        contractType: contract.contractType,
        roomNumber: room.roomNumber,
        roomType: room.roomType.name,
        startDate: contract.startDate,
        endDate: contract.endDate,
        securityDeposit: contract.securityDeposit,
        pdfUrl: contract.pdfUrl,
        status: contract.status,
    };
};
exports.createOfflineContract = createOfflineContract;
//# sourceMappingURL=contractService.js.map