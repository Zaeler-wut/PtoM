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
exports.searchUsers = exports.getProperties = exports.impersonate = exports.deleteUserAccount = exports.deleteAdmin = exports.resetPassword = exports.setStatus = exports.updateLimit = exports.createAdmin = exports.getAdmins = exports.getDashboard = void 0;
const repo = __importStar(require("./superadminRepository"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const getDashboard = () => repo.getDashboardStats();
exports.getDashboard = getDashboard;
const getAdmins = () => repo.getAllAdmins();
exports.getAdmins = getAdmins;
const createAdmin = async (data) => {
    var _a, _b, _c;
    if (!((_a = data.firstName) === null || _a === void 0 ? void 0 : _a.trim()))
        throw new Error("firstName required");
    if (!((_b = data.lastName) === null || _b === void 0 ? void 0 : _b.trim()))
        throw new Error("lastName required");
    if (!((_c = data.email) === null || _c === void 0 ? void 0 : _c.trim()))
        throw new Error("email required");
    if (!data.password || data.password.length < 6)
        throw new Error("password must be at least 6 characters");
    const hashed = await (0, password_1.hashPassword)(data.password);
    return repo.createAdmin({ ...data, password: hashed });
};
exports.createAdmin = createAdmin;
const updateLimit = (userId, propertyLimit) => {
    if (!propertyLimit || propertyLimit < 1)
        throw new Error("propertyLimit must be >= 1");
    return repo.updateAdminLimit(userId, propertyLimit);
};
exports.updateLimit = updateLimit;
const setStatus = async (userId, isActive) => {
    const user = await repo.findUserById(userId);
    if (!user)
        throw new Error("User not found");
    return repo.setUserStatus(userId, isActive);
};
exports.setStatus = setStatus;
const resetPassword = async (userId, newPassword) => {
    if (!newPassword || newPassword.length < 6)
        throw new Error("password must be at least 6 characters");
    const user = await repo.findUserById(userId);
    if (!user)
        throw new Error("User not found");
    const hashed = await (0, password_1.hashPassword)(newPassword);
    return repo.resetPassword(userId, hashed);
};
exports.resetPassword = resetPassword;
const verifyRequesterPassword = async (requesterId, password) => {
    const requester = await repo.findUserPasswordById(requesterId);
    if (!requester)
        throw new Error("Requester not found");
    const valid = await (0, password_1.comparePassword)(password, requester.password);
    if (!valid)
        throw new Error("รหัสผ่านไม่ถูกต้อง");
};
const deleteAdmin = async (userId, requesterId, password) => {
    await verifyRequesterPassword(requesterId, password);
    const user = await repo.findUserById(userId);
    if (!user)
        throw new Error("User not found");
    return repo.deleteUser(userId);
};
exports.deleteAdmin = deleteAdmin;
const deleteUserAccount = async (userId, requesterId, password) => {
    await verifyRequesterPassword(requesterId, password);
    const user = await repo.findUserById(userId);
    if (!user)
        throw new Error("User not found");
    return repo.deleteUser(userId);
};
exports.deleteUserAccount = deleteUserAccount;
// Impersonate — คืน access token ของ user นั้นให้ superadmin ใช้
const impersonate = async (userId) => {
    const user = await repo.findUserById(userId);
    if (!user)
        throw new Error("User not found");
    if (!user.isActive)
        throw new Error("User is inactive");
    // generate short-lived token (1h)
    const token = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role, email: user.email, firstName: '', lastName: '' });
    return { accessToken: token, userId: user.id, role: user.role };
};
exports.impersonate = impersonate;
const getProperties = async () => {
    const rows = await repo.getAllProperties();
    return rows.map(p => {
        var _a, _b;
        return ({
            id: p.id,
            name: p.name,
            address: p.address,
            createdAt: p.createdAt,
            totalRooms: p.rooms.length,
            admin: (_b = (_a = p.admins[0]) === null || _a === void 0 ? void 0 : _a.user) !== null && _b !== void 0 ? _b : null,
        });
    });
};
exports.getProperties = getProperties;
const searchUsers = (q) => {
    if (!(q === null || q === void 0 ? void 0 : q.trim()))
        throw new Error("query required");
    return repo.searchUsers(q.trim());
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=superadminService.js.map