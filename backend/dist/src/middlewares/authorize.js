"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map