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
exports.getMyBookings = exports.cancelBooking = exports.createBooking = exports.getBookingInfo = void 0;
const repo = __importStar(require("./bookingRepository"));
const toBkk = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(d);
// 1. ดึงข้อมูลสำหรับหน้าจอง
const getBookingInfo = async (propertyId, roomTypeId) => {
    var _a;
    const [rt, { rooms, preparingDays }] = await Promise.all([
        repo.getBookingInfo(propertyId, roomTypeId),
        repo.getRoomsForAvailabilityCheck(propertyId, roomTypeId),
    ]);
    if (!rt)
        throw new Error("RoomType not found or not available for online booking");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 45);
    // ถ้าไม่มีห้อง AVAILABLE เลย แต่มีห้อง PREPARING/MOVE_OUT_NOTICE
    // → minMoveInDate คือวันที่ห้องจะพร้อมเร็วสุด
    const hasAvailableNow = rooms.some(r => r.status === "AVAILABLE");
    let minMoveInDate;
    if (!hasAvailableNow) {
        let earliestReady = null;
        for (const room of rooms) {
            let readyDate = null;
            if (room.status === "PREPARING") {
                const moveOut = room.moveOutBills[0];
                if (!moveOut) {
                    readyDate = new Date(today); // พร้อมแล้ว
                }
                else {
                    readyDate = new Date(moveOut.moveOutDate);
                    readyDate.setDate(readyDate.getDate() + preparingDays);
                }
            }
            else if (room.status === "OCCUPIED") {
                const contract = room.contracts[0];
                if (contract === null || contract === void 0 ? void 0 : contract.moveOutNoticeDate) {
                    readyDate = new Date(contract.moveOutNoticeDate);
                    readyDate.setDate(readyDate.getDate() + preparingDays);
                }
            }
            if (readyDate && (!earliestReady || readyDate < earliestReady)) {
                earliestReady = readyDate;
            }
        }
        // ใช้วันที่พร้อมเร็วสุด (แต่ไม่น้อยกว่าพรุ่งนี้)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        minMoveInDate = earliestReady && earliestReady > tomorrow ? earliestReady : tomorrow;
    }
    else {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        minMoveInDate = tomorrow;
    }
    return {
        propertyName: rt.property.name,
        roomTypeName: rt.name,
        roomPrice: rt.roomPrice,
        furniturePrice: (_a = rt.furniturePrice) !== null && _a !== void 0 ? _a : 0,
        bookingFee: rt.bookingFee,
        payment: {
            paymentQrUrl: rt.property.paymentQrUrl,
            bankName: rt.property.bankName,
            bankAccount: rt.property.bankAccount,
            bankHolder: rt.property.bankHolder,
        },
        minMoveInDate: toBkk(minMoveInDate),
        maxMoveInDate: toBkk(maxDate),
    };
};
exports.getBookingInfo = getBookingInfo;
// 2. สร้าง booking
const createBooking = async (propertyId, roomTypeId, userId, data) => {
    var _a;
    if (!data.moveInDate)
        throw new Error("moveInDate is required");
    if (!data.slipUrl)
        throw new Error("slipUrl is required");
    const moveInDate = new Date(data.moveInDate);
    if (isNaN(moveInDate.getTime()))
        throw new Error("moveInDate is invalid");
    moveInDate.setHours(0, 0, 0, 0);
    // ดึง roomType + คำนวณ minMoveInDate ตาม availability จริง
    const [rt, { rooms, preparingDays }] = await Promise.all([
        repo.getBookingInfo(propertyId, roomTypeId),
        repo.getRoomsForAvailabilityCheck(propertyId, roomTypeId),
    ]);
    if (!rt)
        throw new Error("RoomType not found or not available for online booking");
    // คำนวณ minMoveInDate: ถ้าไม่มีห้อง AVAILABLE → ใช้วันที่ห้องพร้อมเร็วสุด
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 45);
    const hasAvailableNow = rooms.some(r => r.status === "AVAILABLE");
    let minMoveInDate = tomorrow;
    if (!hasAvailableNow) {
        let earliest = null;
        for (const room of rooms) {
            let ready = null;
            if (room.status === "PREPARING") {
                const mo = room.moveOutBills[0];
                ready = mo ? (() => { const d = new Date(mo.moveOutDate); d.setDate(d.getDate() + preparingDays); return d; })() : new Date(today);
            }
            else if (room.status === "OCCUPIED" && ((_a = room.contracts[0]) === null || _a === void 0 ? void 0 : _a.moveOutNoticeDate)) {
                ready = new Date(room.contracts[0].moveOutNoticeDate);
                ready.setDate(ready.getDate() + preparingDays);
            }
            if (ready && (!earliest || ready < earliest))
                earliest = ready;
        }
        if (earliest && earliest > tomorrow)
            minMoveInDate = earliest;
    }
    if (moveInDate < minMoveInDate)
        throw new Error(`moveInDate (${toBkk(moveInDate)}) is before the earliest available date (${toBkk(minMoveInDate)})`);
    if (moveInDate > maxDate)
        throw new Error("moveInDate must be within 45 days from today");
    const booking = await repo.createBooking({
        propertyId,
        roomTypeId,
        userId,
        moveInDate,
        bookingFee: rt.bookingFee,
        slipUrl: data.slipUrl,
    });
    // ดึงข้อมูลครบสำหรับ response
    const full = await repo.getBookingById(booking.id);
    if (!full)
        throw new Error("Booking not found");
    return {
        bookingId: full.id,
        propertyName: full.property.name,
        roomTypeName: full.roomType.name,
        roomPrice: full.roomType.roomPrice,
        bookingFee: full.bookingFee,
        moveInDate: toBkk(full.moveInDate),
        firstName: full.user.firstName,
        lastName: full.user.lastName,
        status: full.status,
        paidAmount: full.bookingFee,
    };
};
exports.createBooking = createBooking;
// 3. ยกเลิก booking
const cancelBooking = async (bookingId, userId) => {
    const booking = await repo.getBookingById(bookingId);
    if (!booking)
        throw new Error("Booking not found");
    // เช็คว่าเป็น booking ของ user นี้
    if (booking.userId !== userId)
        throw new Error("Unauthorized");
    // ยกเลิกได้เฉพาะ PENDING เท่านั้น
    if (booking.status === "CANCELLED")
        throw new Error("Booking is already cancelled");
    if (booking.status === "CHECKED_IN")
        throw new Error("Cannot cancel checked-in booking");
    await repo.cancelBooking(bookingId);
    // คืนห้องถ้ามีการ assign แล้ว
    if (booking.roomId) {
        await repo.releaseRoom(booking.roomId);
    }
    return {
        message: "Booking cancelled",
        bookingId,
        status: "CANCELLED",
    };
};
exports.cancelBooking = cancelBooking;
// 4. ดึงรายการจองของฉัน (แท็บการจอง)
const getMyBookings = async (userId) => {
    const [bookings, userContracts] = await Promise.all([
        repo.getMyBookings(userId),
        repo.getContractsByUser(userId),
    ]);
    return bookings.map((b) => {
        var _a, _b;
        const hasContract = !!b.contract || userContracts.some((c) => c.bookingId === b.id || (b.roomId !== null && c.roomId === b.roomId));
        const status = (b.status === "CONFIRMED" && hasContract) ? "CHECKED_IN" : b.status;
        return {
            bookingId: b.id,
            propertyName: b.property.name,
            roomTypeName: b.roomType.name,
            roomNumber: (_b = (_a = b.room) === null || _a === void 0 ? void 0 : _a.roomNumber) !== null && _b !== void 0 ? _b : null,
            firstName: b.user.firstName,
            lastName: b.user.lastName,
            moveInDate: toBkk(b.moveInDate),
            bookingFee: b.bookingFee,
            roomPrice: b.roomType.roomPrice,
            createdAt: toBkk(b.createdAt),
            status: status,
            canCancel: status === "PENDING" || status === "CONFIRMED",
        };
    });
};
exports.getMyBookings = getMyBookings;
//# sourceMappingURL=bookingService.js.map