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
exports.getTenantDetail = exports.updateTenantPersonalInfo = exports.getTenants = void 0;
const repo = __importStar(require("./tenantRepository"));
const getTenants = async (propertyId) => {
    const contracts = await repo.getTenantsByProperty(propertyId);
    return contracts.map((c) => ({
        contractId: c.id,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        phone: c.user.phone,
        lineId: c.user.lineId,
        roomNumber: c.room.roomNumber,
        roomType: c.room.roomType.name,
        contractStatus: c.status,
    }));
};
exports.getTenants = getTenants;
const updateTenantPersonalInfo = async (contractId, propertyId, data) => {
    const contract = await repo.getTenantDetail(contractId, propertyId);
    if (!contract)
        throw new Error("Tenant not found");
    await repo.updateUserInfo(contract.user.id, data);
    if (Array.isArray(data.vehicles)) {
        await repo.replaceVehicles(contract.user.id, data.vehicles);
    }
    return { success: true };
};
exports.updateTenantPersonalInfo = updateTenantPersonalInfo;
const getTenantDetail = async (contractId, propertyId) => {
    const contract = await repo.getTenantDetail(contractId, propertyId);
    if (!contract)
        throw new Error("Tenant not found");
    return {
        user: {
            id: contract.user.id,
            firstName: contract.user.firstName,
            lastName: contract.user.lastName,
            email: contract.user.email,
            phone: contract.user.phone,
            lineId: contract.user.lineId,
            citizenId: contract.user.citizenId,
            address: contract.user.address,
        },
        contract: {
            id: contract.id,
            roomNumber: contract.room.roomNumber,
            roomType: contract.room.roomType.name,
            floor: contract.room.floor,
            startDate: contract.startDate,
            endDate: contract.endDate,
            status: contract.status,
            securityDeposit: contract.securityDeposit,
        },
        vehicles: contract.user.vehicles.map((v) => ({
            plateNumber: v.plateNumber,
            type: v.type,
        })),
    };
};
exports.getTenantDetail = getTenantDetail;
//# sourceMappingURL=tenantService.js.map