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
exports.createRoom = exports.getMeterHistory = exports.updateRoom = exports.getRooms = void 0;
const repo = __importStar(require("./roomRepository"));
const getRooms = async (propertyId) => {
    const { rooms, preparingDays } = await repo.getRoomsByProperty(propertyId);
    return rooms.map((room) => {
        var _a, _b;
        const contract = room.contracts[0];
        // คำนวณวันที่ห้องพร้อมจอง
        let availableFromDate = null;
        if (room.status === "PREPARING") {
            const latestMoveOut = room.moveOutBills[0];
            if (latestMoveOut) {
                const d = new Date(latestMoveOut.moveOutDate);
                d.setDate(d.getDate() + preparingDays);
                availableFromDate = d.toISOString().split("T")[0];
            }
            // ไม่มี moveOutBill = admin ตั้งเอง → พร้อมแล้ว ไม่แสดงวัน
        }
        else if ((contract === null || contract === void 0 ? void 0 : contract.status) === "MOVE_OUT_NOTICE" && contract.moveOutNoticeDate) {
            const d = new Date(contract.moveOutNoticeDate);
            d.setDate(d.getDate() + preparingDays);
            availableFromDate = d.toISOString().split("T")[0];
        }
        return {
            id: room.id,
            roomNumber: room.roomNumber,
            floor: room.floor,
            roomTypeId: room.roomType.id,
            roomType: room.roomType.name,
            price: room.roomType.roomPrice + ((_a = room.roomType.furniturePrice) !== null && _a !== void 0 ? _a : 0),
            securityDeposit: room.roomType.securityDeposit,
            advanceRent: room.roomType.advanceRent,
            status: room.status,
            contractStatus: (_b = contract === null || contract === void 0 ? void 0 : contract.status) !== null && _b !== void 0 ? _b : null,
            moveOutNoticeDate: (contract === null || contract === void 0 ? void 0 : contract.moveOutNoticeDate)
                ? contract.moveOutNoticeDate.toISOString().split("T")[0]
                : null,
            availableFromDate,
            tenant: contract
                ? `${contract.user.firstName} ${contract.user.lastName}`
                : null,
        };
    });
};
exports.getRooms = getRooms;
const updateRoom = async (roomId, data) => {
    const room = await repo.getRoomById(roomId);
    if (!room)
        throw new Error("Room not found");
    if (data.status && room.status === "OCCUPIED")
        throw new Error("ห้องมีผู้เช่าอยู่ ไม่สามารถเปลี่ยนสถานะได้");
    if (data.roomNumber && data.roomNumber !== room.roomNumber) {
        const existing = await repo.getRoomByNumberInProperty(room.propertyId, data.roomNumber);
        if (existing)
            throw new Error(`เลขห้อง "${data.roomNumber}" มีอยู่แล้วในสถานที่นี้`);
    }
    return repo.updateRoom(roomId, data);
};
exports.updateRoom = updateRoom;
const getMeterHistory = async (roomId, propertyId) => {
    const readings = await repo.getMeterHistory(roomId, propertyId);
    if (!readings)
        throw new Error("Room not found");
    return readings.map((r) => ({
        id: r.id,
        month: r.month,
        year: r.year,
        waterMeter: r.waterMeter,
        electricMeter: r.electricMeter,
        createdAt: r.createdAt,
    }));
};
exports.getMeterHistory = getMeterHistory;
const createRoom = async (propertyId, data) => {
    if (!data.roomNumber)
        throw new Error("roomNumber is required");
    if (!data.roomTypeId)
        throw new Error("roomTypeId is required");
    return repo.createRoom({
        propertyId,
        roomTypeId: data.roomTypeId,
        roomNumber: data.roomNumber,
        floor: data.floor,
    });
};
exports.createRoom = createRoom;
//# sourceMappingURL=roomService.js.map