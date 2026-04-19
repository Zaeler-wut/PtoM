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
exports.deleteRoomTypeImage = exports.addRoomTypeImages = exports.updateRoomType = exports.getRoomTypeDetail = exports.deleteRoomType = exports.getRoomTypes = exports.createRoomType = exports.setCoverImage = exports.deletePropertyImage = exports.addPropertyImages = exports.deleteProperty = exports.updateProperty = exports.getPropertyDetail = exports.getMyProperties = exports.createProperty = void 0;
const repo = __importStar(require("./propertyRepository"));
const createProperty = async (data) => {
    if (!data.userId)
        throw new Error("userId is required");
    if (!data.name)
        throw new Error("name is required");
    if (!data.address)
        throw new Error("address is required");
    const { count, limit } = await repo.getAdminPropertyLimit(data.userId);
    if (limit === null) {
        throw new Error("ไม่สามารถสร้างสถานที่ได้ กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดสิทธิ์");
    }
    if (count >= limit) {
        throw new Error(`ถึงขีดจำกัดการสร้างสถานที่แล้ว (${count}/${limit})`);
    }
    return repo.createPropertyWithAdmin(data);
};
exports.createProperty = createProperty;
const getMyProperties = async (userId) => {
    const data = await repo.getAdminProperties(userId);
    return data.map((item) => {
        var _a, _b;
        const p = item.property;
        return {
            id: p.id,
            name: p.name,
            address: p.address,
            coverImage: ((_a = p.images.find((img) => img.isCover)) === null || _a === void 0 ? void 0 : _a.url) || ((_b = p.images[0]) === null || _b === void 0 ? void 0 : _b.url) || null,
            totalRooms: p.rooms.length,
            available: p.rooms.filter((r) => r.status === "AVAILABLE").length,
            occupied: p.rooms.filter((r) => r.status === "OCCUPIED").length,
            reserved: p.rooms.filter((r) => r.status === "RESERVED").length,
            bookingCount: p.bookings.filter((b) => b.status !== "CANCELLED").length,
        };
    });
};
exports.getMyProperties = getMyProperties;
const getPropertyDetail = async (propertyId) => {
    const p = await repo.getPropertyById(propertyId);
    if (!p)
        throw new Error("Property not found");
    console.log("raw facilities:", JSON.stringify(p.facilities));
    console.log("raw googleMap:", p.googleMap);
    return {
        id: p.id, name: p.name, address: p.address, googleMap: p.googleMap,
        description: p.description, priceMin: p.priceMin, priceMax: p.priceMax,
        contractTerm: p.contractTerm, preparingDays: p.preparingDays,
        bankName: p.bankName, bankAccount: p.bankAccount, bankHolder: p.bankHolder,
        paymentQrUrl: p.paymentQrUrl, logoUrl: p.logoUrl,
        lat: p.lat, lng: p.lng, billNote: p.billNote, phone: p.phone,
        facilities: p.facilities.map((f) => f.facility.name),
        images: p.images.map((img) => ({ id: img.id, url: img.url, isCover: img.isCover })),
    };
};
exports.getPropertyDetail = getPropertyDetail;
const updateProperty = async (propertyId, data) => {
    console.log("updateProperty payload:", JSON.stringify(data));
    const p = await repo.getPropertyById(propertyId);
    if (!p)
        throw new Error("Property not found");
    if (data.priceMin !== undefined && data.priceMax !== undefined && data.priceMin > data.priceMax) {
        throw new Error("priceMin must not be greater than priceMax");
    }
    await repo.updateProperty(propertyId, data);
    if (Array.isArray(data.facilities)) {
        console.log("saving facilities:", data.facilities);
        await repo.updatePropertyFacilities(propertyId, data.facilities);
    }
    else {
        console.log("facilities not array:", data.facilities);
    }
    return (0, exports.getPropertyDetail)(propertyId);
};
exports.updateProperty = updateProperty;
const deleteProperty = async (propertyId) => {
    const p = await repo.getPropertyById(propertyId);
    if (!p)
        throw new Error("Property not found");
    return repo.deleteProperty(propertyId);
};
exports.deleteProperty = deleteProperty;
const addPropertyImages = async (propertyId, urls) => {
    const p = await repo.getPropertyById(propertyId);
    if (!p)
        throw new Error("Property not found");
    if (!(urls === null || urls === void 0 ? void 0 : urls.length))
        throw new Error("urls is required");
    return repo.addPropertyImages(propertyId, urls);
};
exports.addPropertyImages = addPropertyImages;
const deletePropertyImage = async (propertyId, imageId) => {
    const p = await repo.getPropertyById(propertyId);
    if (!p)
        throw new Error("Property not found");
    if (!p.images.find((img) => img.id === imageId))
        throw new Error("Image not found");
    return repo.deletePropertyImage(imageId);
};
exports.deletePropertyImage = deletePropertyImage;
const setCoverImage = async (propertyId, imageId) => {
    const p = await repo.getPropertyById(propertyId);
    if (!p)
        throw new Error("Property not found");
    if (!p.images.find((img) => img.id === imageId))
        throw new Error("Image not found in this property");
    return repo.setCoverImage(propertyId, imageId);
};
exports.setCoverImage = setCoverImage;
const createRoomType = async (propertyId, data) => {
    if (!data.name)
        throw new Error("name is required");
    return repo.createRoomType(propertyId, data);
};
exports.createRoomType = createRoomType;
const getRoomTypes = async (propertyId) => {
    const roomTypes = await repo.getRoomTypesByProperty(propertyId);
    return roomTypes.map((rt) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description,
        size: rt.size,
        maxOccupants: rt.maxOccupants,
        roomPrice: rt.roomPrice,
        furniturePrice: rt.furniturePrice,
        waterRate: rt.waterRate,
        electricRate: rt.electricRate,
        bookingFee: rt.bookingFee,
        advanceRent: rt.advanceRent,
        securityDeposit: rt.securityDeposit,
        allowOnlineBooking: rt.allowOnlineBooking,
        roomCount: rt.rooms.length,
        fees: rt.fees.map((f) => ({ id: f.id, name: f.title, price: f.amount })),
        facilities: rt.facilities.map((f) => f.facility.name),
        images: rt.images.map((i) => ({ id: i.id, url: i.url })),
    }));
};
exports.getRoomTypes = getRoomTypes;
const deleteRoomType = async (roomTypeId) => {
    const rt = await repo.getRoomTypeById(roomTypeId);
    if (!rt)
        throw new Error("RoomType not found");
    if (rt.rooms.length > 0)
        throw new Error("ไม่สามารถลบได้ มีห้องที่ใช้ประเภทนี้อยู่");
    return repo.deleteRoomType(roomTypeId);
};
exports.deleteRoomType = deleteRoomType;
const getRoomTypeDetail = async (roomTypeId) => {
    const rt = await repo.getRoomTypeById(roomTypeId);
    if (!rt)
        throw new Error("RoomType not found");
    return {
        id: rt.id, name: rt.name, description: rt.description, size: rt.size,
        maxOccupants: rt.maxOccupants, price: rt.roomPrice, furniturePrice: rt.furniturePrice,
        waterRate: rt.waterRate, electricRate: rt.electricRate, bookingFee: rt.bookingFee,
        advanceRent: rt.advanceRent, securityDeposit: rt.securityDeposit,
        allowOnlineBooking: rt.allowOnlineBooking,
        images: rt.images.map((i) => ({ id: i.id, url: i.url })),
        fees: rt.fees.map((f) => ({ id: f.id, title: f.title, amount: f.amount })),
        facilities: rt.facilities.map((f) => f.facility.name),
    };
};
exports.getRoomTypeDetail = getRoomTypeDetail;
const updateRoomType = async (roomTypeId, data) => {
    const rt = await repo.getRoomTypeById(roomTypeId);
    if (!rt)
        throw new Error("RoomType not found");
    if (data.maxOccupants !== undefined && data.maxOccupants < 1)
        throw new Error("maxOccupants must be at least 1");
    if (data.roomPrice !== undefined && data.roomPrice < 0)
        throw new Error("roomPrice must not be negative");
    if (data.waterRate !== undefined && data.waterRate < 0)
        throw new Error("waterRate must not be negative");
    if (data.electricRate !== undefined && data.electricRate < 0)
        throw new Error("electricRate must not be negative");
    const updated = await repo.updateRoomType(roomTypeId, data);
    if (Array.isArray(data.facilities))
        await repo.updateRoomTypeFacilities(roomTypeId, data.facilities);
    if (Array.isArray(data.fees)) {
        await repo.updateRoomTypeFees(roomTypeId, data.fees.filter((f) => f.title && f.amount !== undefined));
    }
    return updated;
};
exports.updateRoomType = updateRoomType;
const addRoomTypeImages = async (roomTypeId, urls) => {
    const rt = await repo.getRoomTypeById(roomTypeId);
    if (!rt)
        throw new Error("RoomType not found");
    if (!(urls === null || urls === void 0 ? void 0 : urls.length))
        throw new Error("urls is required");
    const remaining = 5 - rt.images.length;
    if (remaining <= 0)
        throw new Error("Maximum 5 images allowed");
    return repo.addRoomTypeImages(roomTypeId, urls.slice(0, remaining));
};
exports.addRoomTypeImages = addRoomTypeImages;
const deleteRoomTypeImage = async (roomTypeId, imageId) => {
    const rt = await repo.getRoomTypeById(roomTypeId);
    if (!rt)
        throw new Error("RoomType not found");
    if (!rt.images.find((img) => img.id === imageId))
        throw new Error("Image not found in this room type");
    return repo.deleteRoomTypeImage(imageId);
};
exports.deleteRoomTypeImage = deleteRoomTypeImage;
//# sourceMappingURL=propertyService.js.map