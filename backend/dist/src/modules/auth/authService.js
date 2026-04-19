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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repo = __importStar(require("./authRepository"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
// VALIDATORS
function validateRegister(data) {
    var _a, _b;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
        throw new Error("Invalid email format");
    }
    if (!((_a = data.firstName) === null || _a === void 0 ? void 0 : _a.trim())) {
        throw new Error("First name required");
    }
    if (!((_b = data.lastName) === null || _b === void 0 ? void 0 : _b.trim())) {
        throw new Error("Last name required");
    }
    if (!data.password || data.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }
    if (data.password.length > 72) {
        throw new Error("Password must not exceed 72 characters");
    }
}
function validateLogin(data) {
    var _a;
    if (!((_a = data.email) === null || _a === void 0 ? void 0 : _a.trim())) {
        throw new Error("Email required");
    }
    if (!data.password) {
        throw new Error("Password required");
    }
}
// REGISTER
const register = async (data) => {
    validateRegister(data);
    const email = data.email.trim().toLowerCase();
    const exist = await repo.findByEmail(email);
    if (exist) {
        throw new Error("Email already exists");
    }
    const hashed = await (0, password_1.hashPassword)(data.password);
    const user = await repo.createUser({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email,
        password: hashed,
        role: "USER",
    });
    const accessToken = (0, jwt_1.generateAccessToken)(user);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user);
    await repo.saveRefreshToken(user.id, refreshToken);
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
        },
    };
};
exports.register = register;
// LOGIN
const login = async (data) => {
    validateLogin(data);
    const email = data.email.trim().toLowerCase();
    const user = await repo.findByEmail(email);
    // ใช้ message เดียวกันเพื่อป้องกัน user enumeration
    if (!user) {
        throw new Error("Invalid credentials");
    }
    if (!user.isActive) {
        throw new Error("User account is inactive");
    }
    const valid = await (0, password_1.comparePassword)(data.password, user.password);
    if (!valid) {
        throw new Error("Invalid credentials");
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user);
    // บันทึก refresh token ลง DB
    await repo.saveRefreshToken(user.id, refreshToken);
    await repo.updateLastLogin(user.id);
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
        },
    };
};
exports.login = login;
// REFRESH TOKEN
const refreshToken = async (token) => {
    if (!token) {
        throw new Error("No refresh token");
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new Error("Refresh token expired");
        }
        throw new Error("Invalid refresh token");
    }
    if (!(decoded === null || decoded === void 0 ? void 0 : decoded.sub)) {
        throw new Error("Invalid token payload");
    }
    const stored = await repo.findRefreshToken(token);
    if (!stored || stored.revoked) {
        throw new Error("Refresh token has been revoked");
    }
    const user = await repo.findById(decoded.sub);
    if (!user)
        throw new Error("User not found");
    if (!user.isActive)
        throw new Error("User account is inactive");
    // Token Rotation — revoke ตัวเก่า ออกตัวใหม่
    await repo.revokeRefreshToken(token);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(user);
    await repo.saveRefreshToken(user.id, newRefreshToken);
    return {
        accessToken: (0, jwt_1.generateAccessToken)(user),
        refreshToken: newRefreshToken,
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
        },
    };
};
exports.refreshToken = refreshToken;
const logout = async (token) => {
    if (!token)
        return; // ไม่มี token ก็ logout ได้เลย
    const stored = await repo.findRefreshToken(token);
    if (stored && !stored.revoked) {
        await repo.revokeRefreshToken(token);
    }
};
exports.logout = logout;
//# sourceMappingURL=authService.js.map