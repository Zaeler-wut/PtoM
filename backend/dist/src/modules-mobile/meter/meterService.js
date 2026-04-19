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
exports.saveMeterReading = exports.getRoomsForMeter = exports.getAdminProperties = void 0;
const repo = __importStar(require("./meterRepository"));
const getAdminProperties = async (userId) => {
    const properties = await repo.getAdminProperties(userId);
    return properties.map((p) => {
        var _a, _b;
        const coverImage = ((_a = p.images.find((img) => img.isCover)) === null || _a === void 0 ? void 0 : _a.url) || ((_b = p.images[0]) === null || _b === void 0 ? void 0 : _b.url) || null;
        const roomTypeNames = Array.from(new Set(p.roomTypes.map((rt) => rt.name)));
        return {
            id: p.id,
            name: p.name,
            coverImage,
            totalRooms: p.rooms.length,
            roomTypeNames,
        };
    });
};
exports.getAdminProperties = getAdminProperties;
const getRoomsForMeter = async (propertyId, month, year) => {
    const rooms = await repo.getRoomsWithMeter(propertyId, month, year);
    return rooms.map((r) => {
        var _a, _b, _c, _d;
        return ({
            id: r.id,
            roomNumber: r.roomNumber,
            floor: r.floor,
            roomTypeName: r.roomType.name,
            electricMeter: (_b = (_a = r.meters[0]) === null || _a === void 0 ? void 0 : _a.electricMeter) !== null && _b !== void 0 ? _b : null,
            waterMeter: (_d = (_c = r.meters[0]) === null || _c === void 0 ? void 0 : _c.waterMeter) !== null && _d !== void 0 ? _d : null,
        });
    });
};
exports.getRoomsForMeter = getRoomsForMeter;
const saveMeterReading = async (data) => {
    return repo.upsertMeterReading(data);
};
exports.saveMeterReading = saveMeterReading;
//# sourceMappingURL=meterService.js.map