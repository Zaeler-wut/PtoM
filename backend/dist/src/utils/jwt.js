"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Missing JWT secrets: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set");
}
function generateAccessToken(user) {
    return jsonwebtoken_1.default.sign({
        sub: user.id,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
    }, ACCESS_SECRET, { expiresIn: "1h" });
}
function generateRefreshToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
}
//# sourceMappingURL=jwt.js.map