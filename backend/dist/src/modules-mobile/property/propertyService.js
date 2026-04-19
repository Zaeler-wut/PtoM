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
exports.getPropertyDetail = exports.getRoomTypeDetail = exports.getFeaturedProperties = exports.searchProperties = void 0;
const repo = __importStar(require("./propertyRepository"));
// คำนวณระยะห่างระหว่างสองจุด GPS หน่วย กม.
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // รัศมีโลก กม.
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // ปัดทศนิยม 1 ตำแหน่ง
}
// กรองตามจำนวนคน
function roomMatchesOccupants(room, maxOccupants) {
    if (!maxOccupants)
        return true;
    return room.roomType.maxOccupants >= maxOccupants;
}
// คำนวณวันที่ห้องนี้จะพร้อม (null = พร้อมแล้ว)
function getRoomReadyDate(room, preparingDays) {
    var _a;
    if (room.status === "AVAILABLE")
        return null;
    if (room.status === "PREPARING") {
        const latestMoveOut = room.moveOutBills[0];
        if (!latestMoveOut)
            return null; // admin ตั้งเอง = พร้อมแล้ว
        const d = new Date(latestMoveOut.moveOutDate);
        d.setDate(d.getDate() + preparingDays);
        return d;
    }
    if (room.status === "OCCUPIED") {
        const noticeContract = (_a = room.contracts) === null || _a === void 0 ? void 0 : _a.find((c) => c.status === "MOVE_OUT_NOTICE");
        if (!(noticeContract === null || noticeContract === void 0 ? void 0 : noticeContract.moveOutNoticeDate))
            return null;
        const d = new Date(noticeContract.moveOutNoticeDate);
        d.setDate(d.getDate() + preparingDays);
        return d;
    }
    return null;
}
// นับห้องว่าง + เตรียมว่าง แยกกัน และหาวันที่จะว่างเร็วสุด
function countRooms(rooms, searchDate, preparingDays, maxOccupants) {
    let availableRooms = 0;
    let preparingCount = 0;
    let earliestDate = null;
    for (const room of rooms) {
        if (!roomMatchesOccupants(room, maxOccupants))
            continue;
        const readyDate = getRoomReadyDate(room, preparingDays);
        if (readyDate === null) {
            // AVAILABLE หรือ PREPARING ที่ไม่มี moveOutBill = พร้อมแล้ว
            if (room.status === "AVAILABLE" || room.status === "PREPARING") {
                availableRooms++;
            }
        }
        else if (readyDate <= searchDate) {
            // readyDate ผ่านแล้ว = พร้อมสำหรับ searchDate
            availableRooms++;
        }
        else {
            // ยังไม่ถึงวันพร้อม = เตรียมว่าง
            preparingCount++;
            if (!earliestDate || readyDate < earliestDate) {
                earliestDate = readyDate;
            }
        }
    }
    return {
        availableRooms,
        preparingCount,
        preparingAvailableDate: earliestDate ? earliestDate.toISOString().split("T")[0] : null,
    };
}
const searchProperties = async (query) => {
    var _a, _b, _c, _d;
    const { lat, lng, month, year, day, maxOccupants, radius = 20 } = query;
    if (!lat || !lng)
        throw new Error("lat and lng are required");
    if (!month || month < 1 || month > 12)
        throw new Error("Invalid month");
    if (!year || year < 2000)
        throw new Error("Invalid year");
    // ถ้าส่ง day มา → เช็คระดับวัน, ถ้าไม่ส่ง → ใช้วันสุดท้ายของเดือน (conservative: นับให้มากสุด)
    const searchDate = new Date(year, month - 1, day !== null && day !== void 0 ? day : new Date(year, month, 0).getDate());
    const properties = await repo.getAllProperties();
    const withCoords = [];
    const withoutCoords = [];
    for (const property of properties) {
        const hasCoords = property.lat && property.lng;
        if (hasCoords) {
            const distanceKm = calculateDistance(lat, lng, property.lat, property.lng);
            if (distanceKm > radius)
                continue;
            const counts = countRooms(property.rooms, searchDate, property.preparingDays, maxOccupants);
            if (counts.availableRooms === 0 && counts.preparingCount === 0)
                continue;
            const coverImage = ((_a = property.images.find((img) => img.isCover)) === null || _a === void 0 ? void 0 : _a.url) ||
                ((_b = property.images[0]) === null || _b === void 0 ? void 0 : _b.url) ||
                null;
            withCoords.push({
                id: property.id, name: property.name, address: property.address,
                coverImage, images: property.images.map((img) => img.url),
                facilities: property.facilities.map((f) => f.facility.name),
                contractTerm: property.contractTerm,
                priceMin: property.priceMin, priceMax: property.priceMax,
                totalRooms: property.rooms.length, ...counts, distanceKm,
                lat: property.lat, lng: property.lng, googleMap: property.googleMap,
            });
        }
        else {
            // สถานที่ที่ไม่มีพิกัด — แสดงต่อท้าย
            const counts = countRooms(property.rooms, searchDate, property.preparingDays, maxOccupants);
            if (counts.availableRooms === 0 && counts.preparingCount === 0)
                continue;
            const coverImage = ((_c = property.images.find((img) => img.isCover)) === null || _c === void 0 ? void 0 : _c.url) ||
                ((_d = property.images[0]) === null || _d === void 0 ? void 0 : _d.url) ||
                null;
            withoutCoords.push({
                id: property.id, name: property.name, address: property.address,
                coverImage, images: property.images.map((img) => img.url),
                facilities: property.facilities.map((f) => f.facility.name),
                contractTerm: property.contractTerm,
                priceMin: property.priceMin, priceMax: property.priceMax,
                totalRooms: property.rooms.length, ...counts, distanceKm: 0,
                lat: property.lat, lng: property.lng, googleMap: property.googleMap,
            });
        }
    }
    return [
        ...withCoords.sort((a, b) => a.distanceKm - b.distanceKm),
        ...withoutCoords,
    ];
};
exports.searchProperties = searchProperties;
const getFeaturedProperties = async () => {
    var _a, _b;
    const now = new Date();
    const properties = await repo.getAllProperties();
    const results = [];
    for (const property of properties) {
        const counts = countRooms(property.rooms, now, property.preparingDays);
        const coverImage = ((_a = property.images.find((img) => img.isCover)) === null || _a === void 0 ? void 0 : _a.url) ||
            ((_b = property.images[0]) === null || _b === void 0 ? void 0 : _b.url) ||
            null;
        results.push({
            id: property.id,
            name: property.name,
            address: property.address,
            coverImage,
            images: property.images.map((img) => img.url),
            facilities: property.facilities.map((f) => f.facility.name),
            contractTerm: property.contractTerm,
            priceMin: property.priceMin,
            priceMax: property.priceMax,
            totalRooms: property.rooms.length,
            ...counts,
            distanceKm: 0,
            lat: property.lat,
            lng: property.lng,
            googleMap: property.googleMap,
        });
    }
    return results;
};
exports.getFeaturedProperties = getFeaturedProperties;
// ดูรายละเอียดหอพัก
const getRoomTypeDetail = async (propertyId, roomTypeId) => {
    var _a;
    const property = await repo.getPropertyById(propertyId);
    if (!property)
        throw new Error("Property not found");
    const rt = property.roomTypes.find(r => r.id === roomTypeId);
    if (!rt)
        throw new Error("Room type not found");
    const roomsOfType = property.rooms.filter(r => r.roomTypeId === rt.id);
    const now = new Date();
    const { availableRooms, preparingCount, preparingAvailableDate } = countRooms(roomsOfType, now, property.preparingDays);
    return {
        id: rt.id,
        name: rt.name,
        description: rt.description,
        size: rt.size,
        maxOccupants: rt.maxOccupants,
        roomPrice: rt.roomPrice,
        furniturePrice: (_a = rt.furniturePrice) !== null && _a !== void 0 ? _a : 0,
        bookingFee: rt.bookingFee,
        advanceRent: rt.advanceRent,
        securityDeposit: rt.securityDeposit,
        waterRate: rt.waterRate,
        electricRate: rt.electricRate,
        availableRooms,
        preparingCount,
        preparingAvailableDate,
        totalRooms: roomsOfType.length,
        images: rt.images.map(i => i.url),
        facilities: rt.facilities.map(f => f.facility.name),
        propertyName: property.name,
        propertyId: property.id,
        payment: {
            paymentQrUrl: property.paymentQrUrl,
            bankName: property.bankName,
            bankAccount: property.bankAccount,
            bankHolder: property.bankHolder,
        },
    };
};
exports.getRoomTypeDetail = getRoomTypeDetail;
const getPropertyDetail = async (propertyId, query) => {
    var _a, _b, _c;
    const property = await repo.getPropertyById(propertyId);
    if (!property)
        throw new Error("Property not found");
    const { month, year, day } = query;
    const searchDate = month && year
        ? new Date(year, month - 1, day !== null && day !== void 0 ? day : new Date(year, month, 0).getDate())
        : null;
    const coverImage = ((_a = property.images.find((img) => img.isCover)) === null || _a === void 0 ? void 0 : _a.url) ||
        ((_b = property.images[0]) === null || _b === void 0 ? void 0 : _b.url) ||
        null;
    const roomTypes = property.roomTypes.map((rt) => {
        const roomsOfType = property.rooms.filter((r) => r.roomTypeId === rt.id);
        const effectiveDate = searchDate !== null && searchDate !== void 0 ? searchDate : new Date();
        const counts = countRooms(roomsOfType.filter((r) => roomMatchesOccupants(r, query.maxOccupants)), effectiveDate, property.preparingDays);
        return {
            id: rt.id,
            name: rt.name,
            description: rt.description,
            size: rt.size,
            maxOccupants: rt.maxOccupants,
            roomPrice: rt.roomPrice,
            furniturePrice: rt.furniturePrice,
            bookingFee: rt.bookingFee,
            advanceRent: rt.advanceRent,
            securityDeposit: rt.securityDeposit,
            waterRate: rt.waterRate,
            electricRate: rt.electricRate,
            allowOnlineBooking: rt.allowOnlineBooking,
            availableRooms: counts.availableRooms + counts.preparingCount,
            preparingCount: counts.preparingCount,
            preparingAvailableDate: counts.preparingAvailableDate,
            images: rt.images.map((i) => i.url),
            facilities: rt.facilities.map((f) => f.facility.name),
            fees: rt.fees.map((f) => ({ title: f.title, amount: f.amount })),
        };
    });
    return {
        id: property.id,
        name: property.name,
        address: property.address,
        phone: (_c = property.phone) !== null && _c !== void 0 ? _c : null,
        googleMap: property.googleMap,
        description: property.description,
        contractTerm: property.contractTerm,
        priceMin: property.priceMin,
        priceMax: property.priceMax,
        lat: property.lat,
        lng: property.lng,
        bankName: property.bankName,
        bankAccount: property.bankAccount,
        bankHolder: property.bankHolder,
        paymentQrUrl: property.paymentQrUrl,
        logoUrl: property.logoUrl,
        coverImage,
        images: property.images.map((img) => img.url),
        facilities: property.facilities.map((f) => f.facility.name),
        roomTypes,
    };
};
exports.getPropertyDetail = getPropertyDetail;
//# sourceMappingURL=propertyService.js.map