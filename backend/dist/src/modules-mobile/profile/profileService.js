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
exports.updateProfile = exports.getProfile = void 0;
const repo = __importStar(require("./profileRepository"));
const getProfile = async (userId) => {
    var _a, _b;
    const user = await repo.getUserProfile(userId);
    if (!user)
        throw new Error("User not found");
    // ห้องปัจจุบัน
    const activeContract = (_a = user.contracts[0]) !== null && _a !== void 0 ? _a : null;
    let currentRoom = null;
    if (activeContract) {
        const rt = activeContract.room.roomType;
        const monthlyRent = rt.roomPrice + ((_b = rt.furniturePrice) !== null && _b !== void 0 ? _b : 0);
        currentRoom = {
            propertyName: activeContract.room.property.name,
            roomNumber: activeContract.room.roomNumber,
            roomType: rt.name,
            startDate: activeContract.startDate.toISOString().split("T")[0],
            monthlyRent,
            roomPrice: rt.roomPrice,
            furniturePrice: rt.furniturePrice,
        };
    }
    // สรุปบิล
    const total = user.bills.length;
    const paid = user.bills.filter((b) => b.status === "PAID").length;
    const unpaid = user.bills.filter((b) => b.status === "PENDING" || b.status === "VERIFYING").length;
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        currentRoom,
        billSummary: { total, paid, unpaid },
    };
};
exports.getProfile = getProfile;
const updateProfile = async (userId, data) => {
    var _a, _b;
    if (!((_a = data.firstName) === null || _a === void 0 ? void 0 : _a.trim()))
        throw new Error("firstName is required");
    if (!((_b = data.lastName) === null || _b === void 0 ? void 0 : _b.trim()))
        throw new Error("lastName is required");
    return repo.updateUserProfile(userId, data);
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=profileService.js.map