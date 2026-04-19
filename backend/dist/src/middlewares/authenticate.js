"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    var _a;
    const authHeader = req.headers.authorization;
    const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))
        ? authHeader.slice(7)
        : null;
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.sub) || !(decoded === null || decoded === void 0 ? void 0 : decoded.role)) {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        ;
        req.user = {
            id: decoded.sub,
            role: decoded.role,
            email: (_a = decoded.email) !== null && _a !== void 0 ? _a : "",
        };
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map