"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoomTypeImage = exports.addRoomTypeImages = exports.updateRoomTypeFees = exports.updateRoomTypeFacilities = exports.updateRoomType = exports.getRoomTypeById = exports.deleteRoomType = exports.getRoomTypesByProperty = exports.createRoomType = exports.setCoverImage = exports.deletePropertyImage = exports.addPropertyImages = exports.deleteProperty = exports.updatePropertyFacilities = exports.updateProperty = exports.getPropertyById = exports.createPropertyWithAdmin = exports.getAdminPropertyLimit = exports.getAdminProperties = void 0;
const prisma_1 = require("../../lib/prisma");
const getAdminProperties = async (userId) => {
    return prisma_1.prisma.propertyAdmin.findMany({
        where: { userId },
        include: {
            property: {
                include: { rooms: true, bookings: true, images: true },
            },
        },
    });
};
exports.getAdminProperties = getAdminProperties;
const getAdminPropertyLimit = async (userId) => {
    var _a;
    const [count, limit] = await Promise.all([
        prisma_1.prisma.propertyAdmin.count({ where: { userId } }),
        prisma_1.prisma.adminLimit.findUnique({ where: { userId }, select: { propertyLimit: true } }),
    ]);
    return { count, limit: (_a = limit === null || limit === void 0 ? void 0 : limit.propertyLimit) !== null && _a !== void 0 ? _a : null };
};
exports.getAdminPropertyLimit = getAdminPropertyLimit;
const createPropertyWithAdmin = async (data) => {
    var _a;
    return prisma_1.prisma.property.create({
        data: {
            name: data.name,
            address: data.address,
            googleMap: data.googleMap,
            description: data.description,
            priceMin: data.priceMin,
            priceMax: data.priceMax,
            contractTerm: data.contractTerm,
            preparingDays: (_a = data.preparingDays) !== null && _a !== void 0 ? _a : 3,
            bankName: data.bankName,
            bankAccount: data.bankAccount,
            bankHolder: data.bankHolder,
            paymentQrUrl: data.paymentQrUrl,
            logoUrl: data.logoUrl,
            admins: { create: { userId: data.userId } },
        },
    });
};
exports.createPropertyWithAdmin = createPropertyWithAdmin;
const getPropertyById = async (propertyId) => {
    return prisma_1.prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            images: true,
            facilities: { include: { facility: true } },
        },
    });
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (propertyId, data) => {
    return prisma_1.prisma.property.update({
        where: { id: propertyId },
        data: {
            name: data.name,
            address: data.address,
            googleMap: data.googleMap,
            description: data.description,
            priceMin: data.priceMin,
            priceMax: data.priceMax,
            contractTerm: data.contractTerm,
            preparingDays: data.preparingDays,
            bankName: data.bankName,
            bankAccount: data.bankAccount,
            bankHolder: data.bankHolder,
            paymentQrUrl: data.paymentQrUrl,
            logoUrl: data.logoUrl,
            lat: data.lat,
            lng: data.lng,
            billNote: data.billNote,
            phone: data.phone,
        },
    });
};
exports.updateProperty = updateProperty;
const updatePropertyFacilities = async (propertyId, facilityNames) => {
    await prisma_1.prisma.propertyFacility.deleteMany({ where: { propertyId } });
    if (facilityNames.length === 0)
        return;
    const facilities = await Promise.all(facilityNames.map(async (name) => {
        let f = await prisma_1.prisma.facility.findUnique({ where: { name } });
        if (!f)
            f = await prisma_1.prisma.facility.create({ data: { name } });
        return f;
    }));
    await prisma_1.prisma.propertyFacility.createMany({
        data: facilities.map((f) => ({ propertyId, facilityId: f.id })),
    });
};
exports.updatePropertyFacilities = updatePropertyFacilities;
const deleteProperty = async (propertyId) => {
    // ลบจาก leaf → root เพื่อหลีกเลี่ยง FK constraint
    const rooms = await prisma_1.prisma.room.findMany({ where: { propertyId }, select: { id: true } });
    const roomIds = rooms.map((r) => r.id);
    const contracts = await prisma_1.prisma.contract.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } });
    const contractIds = contracts.map((c) => c.id);
    const moveOutBills = await prisma_1.prisma.moveOutBill.findMany({ where: { contractId: { in: contractIds } }, select: { id: true } });
    await prisma_1.prisma.moveOutBillItem.deleteMany({ where: { moveOutBillId: { in: moveOutBills.map((m) => m.id) } } });
    await prisma_1.prisma.moveOutBill.deleteMany({ where: { contractId: { in: contractIds } } });
    const bills = await prisma_1.prisma.bill.findMany({ where: { contractId: { in: contractIds } }, select: { id: true } });
    const billIds = bills.map((b) => b.id);
    await prisma_1.prisma.payment.deleteMany({ where: { billId: { in: billIds } } });
    await prisma_1.prisma.billItem.deleteMany({ where: { billId: { in: billIds } } });
    await prisma_1.prisma.bill.deleteMany({ where: { contractId: { in: contractIds } } });
    await prisma_1.prisma.contract.deleteMany({ where: { id: { in: contractIds } } });
    const meters = await prisma_1.prisma.meterReading.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } });
    await prisma_1.prisma.meterImage.deleteMany({ where: { meterReadingId: { in: meters.map((m) => m.id) } } });
    await prisma_1.prisma.meterReading.deleteMany({ where: { roomId: { in: roomIds } } });
    await prisma_1.prisma.booking.deleteMany({ where: { propertyId } });
    await prisma_1.prisma.room.deleteMany({ where: { propertyId } });
    const roomTypes = await prisma_1.prisma.roomType.findMany({ where: { propertyId }, select: { id: true } });
    const roomTypeIds = roomTypes.map((rt) => rt.id);
    await prisma_1.prisma.roomTypeFee.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } });
    await prisma_1.prisma.roomTypeImage.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } });
    await prisma_1.prisma.roomFacility.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } });
    await prisma_1.prisma.roomType.deleteMany({ where: { propertyId } });
    await prisma_1.prisma.propertyFacility.deleteMany({ where: { propertyId } });
    await prisma_1.prisma.propertyImage.deleteMany({ where: { propertyId } });
    await prisma_1.prisma.propertyAdmin.deleteMany({ where: { propertyId } });
    return prisma_1.prisma.property.delete({ where: { id: propertyId } });
};
exports.deleteProperty = deleteProperty;
const addPropertyImages = async (propertyId, urls) => {
    return prisma_1.prisma.propertyImage.createMany({
        data: urls.map((url) => ({ propertyId, url })),
    });
};
exports.addPropertyImages = addPropertyImages;
const deletePropertyImage = async (imageId) => {
    return prisma_1.prisma.propertyImage.delete({ where: { id: imageId } });
};
exports.deletePropertyImage = deletePropertyImage;
const setCoverImage = async (propertyId, imageId) => {
    await prisma_1.prisma.propertyImage.updateMany({ where: { propertyId }, data: { isCover: false } });
    return prisma_1.prisma.propertyImage.update({ where: { id: imageId }, data: { isCover: true } });
};
exports.setCoverImage = setCoverImage;
// ROOM TYPES
const createRoomType = async (propertyId, data) => {
    var _a;
    const facilities = await Promise.all((data.facilities || []).map(async (name) => {
        let f = await prisma_1.prisma.facility.findUnique({ where: { name } });
        if (!f)
            f = await prisma_1.prisma.facility.create({ data: { name } });
        return f;
    }));
    return prisma_1.prisma.roomType.create({
        data: {
            propertyId,
            name: data.name,
            description: data.description,
            size: data.size,
            maxOccupants: data.maxOccupants,
            roomPrice: data.roomPrice,
            furniturePrice: data.furniturePrice,
            bookingFee: data.bookingFee,
            advanceRent: data.advanceRent,
            securityDeposit: data.securityDeposit,
            waterRate: data.waterRate,
            electricRate: data.electricRate,
            allowOnlineBooking: (_a = data.allowOnlineBooking) !== null && _a !== void 0 ? _a : true,
            facilities: { create: facilities.map((f) => ({ facilityId: f.id })) },
            images: { create: (data.images || []).slice(0, 5).map((url) => ({ url })) },
            fees: { create: (data.fees || []).map((f) => ({ title: f.title, amount: f.amount })) },
        },
    });
};
exports.createRoomType = createRoomType;
const getRoomTypesByProperty = async (propertyId) => {
    return prisma_1.prisma.roomType.findMany({
        where: { propertyId },
        include: {
            images: true,
            fees: true,
            facilities: { include: { facility: true } },
            rooms: { select: { id: true } },
        },
        orderBy: { id: "asc" },
    });
};
exports.getRoomTypesByProperty = getRoomTypesByProperty;
const deleteRoomType = async (roomTypeId) => {
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.roomTypeImage.deleteMany({ where: { roomTypeId } }),
        prisma_1.prisma.roomTypeFee.deleteMany({ where: { roomTypeId } }),
        prisma_1.prisma.roomFacility.deleteMany({ where: { roomTypeId } }),
    ]);
    return prisma_1.prisma.roomType.delete({ where: { id: roomTypeId } });
};
exports.deleteRoomType = deleteRoomType;
const getRoomTypeById = async (roomTypeId) => {
    return prisma_1.prisma.roomType.findUnique({
        where: { id: roomTypeId },
        include: {
            images: true,
            fees: true,
            facilities: { include: { facility: true } },
            rooms: { select: { id: true } },
        },
    });
};
exports.getRoomTypeById = getRoomTypeById;
const updateRoomType = async (roomTypeId, data) => {
    return prisma_1.prisma.roomType.update({
        where: { id: roomTypeId },
        data: {
            name: data.name,
            description: data.description,
            size: data.size,
            maxOccupants: data.maxOccupants,
            roomPrice: data.roomPrice,
            furniturePrice: data.furniturePrice,
            bookingFee: data.bookingFee,
            advanceRent: data.advanceRent,
            securityDeposit: data.securityDeposit,
            waterRate: data.waterRate,
            electricRate: data.electricRate,
            allowOnlineBooking: data.allowOnlineBooking,
        },
    });
};
exports.updateRoomType = updateRoomType;
const updateRoomTypeFacilities = async (roomTypeId, facilityNames) => {
    await prisma_1.prisma.roomFacility.deleteMany({ where: { roomTypeId } });
    if (facilityNames.length === 0)
        return;
    const facilities = await Promise.all(facilityNames.map(async (name) => {
        let f = await prisma_1.prisma.facility.findUnique({ where: { name } });
        if (!f)
            f = await prisma_1.prisma.facility.create({ data: { name } });
        return f;
    }));
    await prisma_1.prisma.roomFacility.createMany({
        data: facilities.map((f) => ({ roomTypeId, facilityId: f.id })),
    });
};
exports.updateRoomTypeFacilities = updateRoomTypeFacilities;
const updateRoomTypeFees = async (roomTypeId, fees) => {
    await prisma_1.prisma.roomTypeFee.deleteMany({ where: { roomTypeId } });
    if (fees.length === 0)
        return;
    await prisma_1.prisma.roomTypeFee.createMany({
        data: fees.map((f) => ({ roomTypeId, title: f.title, amount: f.amount })),
    });
};
exports.updateRoomTypeFees = updateRoomTypeFees;
const addRoomTypeImages = async (roomTypeId, urls) => {
    return prisma_1.prisma.roomTypeImage.createMany({ data: urls.map((url) => ({ roomTypeId, url })) });
};
exports.addRoomTypeImages = addRoomTypeImages;
const deleteRoomTypeImage = async (imageId) => {
    return prisma_1.prisma.roomTypeImage.delete({ where: { id: imageId } });
};
exports.deleteRoomTypeImage = deleteRoomTypeImage;
//# sourceMappingURL=propertyRepository.js.map