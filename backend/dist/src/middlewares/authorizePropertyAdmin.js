"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePropertyAdmin = void 0;
const prisma_1 = require("../lib/prisma");
const authorizePropertyAdmin = () => {
    return async (req, res, next) => {
        var _a, _b;
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: "Not authenticated" });
            }
            const propertyId = (_b = (_a = req.params.propertyId) !== null && _a !== void 0 ? _a : req.body.propertyId) !== null && _b !== void 0 ? _b : req.query.propertyId;
            if (!propertyId) {
                return res.status(400).json({ error: "propertyId is required" });
            }
            if (user.role === "ADMIN") {
                const admin = await prisma_1.prisma.propertyAdmin.findFirst({
                    where: { userId: user.id, propertyId: String(propertyId) },
                });
                if (!admin) {
                    return res.status(403).json({ error: "You are not admin of this property" });
                }
            }
            next();
        }
        catch (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
    };
};
exports.authorizePropertyAdmin = authorizePropertyAdmin;
//# sourceMappingURL=authorizePropertyAdmin.js.map