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
exports.getMyContracts = void 0;
const repo = __importStar(require("./contractRepository"));
const getMyContracts = async (userId) => {
    const contracts = await repo.getMyContracts(userId);
    return contracts.map((c) => {
        const months = Math.round((c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const duration = months >= 12
            ? `${Math.floor(months / 12)} ปี${months % 12 > 0 ? ` ${months % 12} เดือน` : ""}`
            : `${months} เดือน`;
        return {
            contractId: c.id,
            propertyName: c.room.property.name,
            roomNumber: c.room.roomNumber,
            contractDuration: duration,
            startDate: c.startDate.toISOString().split("T")[0],
            endDate: c.endDate.toISOString().split("T")[0],
            status: c.status,
            pdfUrl: c.pdfUrl,
        };
    });
};
exports.getMyContracts = getMyContracts;
//# sourceMappingURL=contractService.js.map