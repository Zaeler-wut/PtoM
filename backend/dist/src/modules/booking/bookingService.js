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
exports.cancelBooking = exports.confirmBooking = exports.assignRoom = exports.getBookingForContract = exports.getBookingDetail = exports.getBookings = void 0;
const repo = __importStar(require("./bookingRepository"));
const contractRepository_1 = require("../contract/contractRepository");
const getBookings = async (propertyId) => {
    const bookings = await repo.getBookingsByProperty(propertyId);
    return bookings.map((b) => {
        var _a, _b;
        const hasContract = !!b.contract || b.user.contracts.some((c) => c.bookingId === b.id || (b.roomId !== null && c.roomId === b.roomId));
        const status = (b.status === "CONFIRMED" && hasContract) ? "CHECKED_IN" : b.status;
        return {
            bookingId: b.id,
            firstName: b.user.firstName,
            lastName: b.user.lastName,
            phone: b.user.phone,
            roomNumber: (_b = (_a = b.room) === null || _a === void 0 ? void 0 : _a.roomNumber) !== null && _b !== void 0 ? _b : "-",
            roomType: b.roomType.name,
            moveInDate: b.moveInDate,
            bookingFee: b.bookingFee,
            slipUrl: b.slipUrl,
            status,
        };
    });
};
exports.getBookings = getBookings;
const getBookingDetail = async (bookingId, propertyId) => {
    var _a, _b;
    const booking = await repo.getBookingDetail(bookingId, propertyId);
    if (!booking)
        throw new Error("Booking not found");
    return {
        bookingId: booking.id,
        firstName: booking.user.firstName,
        lastName: booking.user.lastName,
        phone: booking.user.phone,
        roomNumber: (_b = (_a = booking.room) === null || _a === void 0 ? void 0 : _a.roomNumber) !== null && _b !== void 0 ? _b : "-",
        roomType: booking.roomType.name,
        bookingDate: booking.createdAt,
        moveInDate: booking.moveInDate,
        bookingFee: booking.bookingFee,
        advanceRent: booking.roomType.advanceRent,
        securityDeposit: booking.roomType.securityDeposit,
        slipUrl: booking.slipUrl,
        status: booking.status,
    };
};
exports.getBookingDetail = getBookingDetail;
const getBookingForContract = async (bookingId, propertyId) => {
    var _a, _b, _c, _d;
    const booking = await repo.getBookingForContract(bookingId, propertyId);
    if (!booking)
        throw new Error("Booking not found or not confirmed");
    const existing = await (0, contractRepository_1.checkExistingContract)(bookingId);
    if (existing)
        throw new Error("Contract already exists for this booking");
    const rt = booking.roomType;
    return {
        bookingId: booking.id,
        firstName: booking.user.firstName,
        lastName: booking.user.lastName,
        email: booking.user.email,
        phone: booking.user.phone,
        lineId: booking.user.lineId,
        address: booking.user.address,
        roomId: (_b = (_a = booking.room) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
        roomNumber: (_d = (_c = booking.room) === null || _c === void 0 ? void 0 : _c.roomNumber) !== null && _d !== void 0 ? _d : "-",
        roomType: rt.name,
        moveInDate: booking.moveInDate,
        securityDeposit: rt.securityDeposit,
        advanceRent: rt.advanceRent,
        totalDeposit: rt.securityDeposit + rt.advanceRent,
        vehicles: booking.user.vehicles.map((v) => ({
            plateNumber: v.plateNumber,
            type: v.type,
        })),
    };
};
exports.getBookingForContract = getBookingForContract;
// ROOM ASSIGNMENT
const assignRoom = async (bookingId, propertyId) => {
    var _a;
    const booking = await repo.getBookingDetail(bookingId, propertyId);
    if (!booking)
        throw new Error("Booking not found");
    if (booking.status !== "PENDING")
        throw new Error("Booking is not in PENDING status");
    if (!booking.moveInDate)
        throw new Error("moveInDate is required");
    const preparingDays = await repo.getPropertyPreparingDays(propertyId);
    const { availableRooms, preparingRooms } = await repo.getAvailableRoomsForDate(propertyId, booking.roomTypeId, new Date(booking.moveInDate), preparingDays);
    // Priority: ให้ PREPARING/OCCUPIED-NOTICE ก่อน เพื่อเซฟ AVAILABLE ไว้ให้คนเข้าเร็วกว่า
    const selectedRoom = (_a = preparingRooms[0]) !== null && _a !== void 0 ? _a : availableRooms[0];
    if (!selectedRoom)
        throw new Error("No available room for this date");
    await repo.assignRoomToBooking(bookingId, selectedRoom.id);
    // ห้อง OCCUPIED ยังมีผู้เช่าอยู่ → ไม่เปลี่ยนสถานะ (ปล่อยให้กระบวนการ move-out จัดการ)
    // ห้อง AVAILABLE / PREPARING → เปลี่ยนเป็น RESERVED
    if (selectedRoom.status !== "OCCUPIED") {
        await repo.reserveRoom(selectedRoom.id);
    }
    return {
        bookingId,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        assignedAt: new Date(),
    };
};
exports.assignRoom = assignRoom;
// ยืนยัน booking (admin กด confirm)
const confirmBooking = async (bookingId, propertyId) => {
    const booking = await repo.getBookingDetail(bookingId, propertyId);
    if (!booking)
        throw new Error("Booking not found");
    // ถ้ายังไม่มีห้อง → auto assign ก่อน
    if (!booking.roomId) {
        await (0, exports.assignRoom)(bookingId, propertyId);
    }
    else {
        await repo.confirmBooking(bookingId);
    }
    return { message: "Booking confirmed" };
};
exports.confirmBooking = confirmBooking;
// ยกเลิก booking
const cancelBooking = async (bookingId, propertyId) => {
    const booking = await repo.getBookingDetail(bookingId, propertyId);
    if (!booking)
        throw new Error("Booking not found");
    if (booking.status === "CHECKED_IN")
        throw new Error("ไม่สามารถยกเลิกการจองที่เข้าอยู่แล้วได้");
    const existingContract = await (0, contractRepository_1.checkExistingContract)(bookingId);
    if (existingContract)
        throw new Error("ไม่สามารถยกเลิกการจองที่มีสัญญาเช่าแล้วได้");
    await repo.cancelBooking(bookingId);
    // คืน room ถ้ามีการ assign แล้ว
    if (booking.roomId) {
        await repo.releaseRoom(booking.roomId);
    }
    return { message: "Booking cancelled" };
};
exports.cancelBooking = cancelBooking;
//# sourceMappingURL=bookingService.js.map