"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshToken = exports.findRefreshToken = exports.saveRefreshToken = exports.updateLastLogin = exports.createUser = exports.findById = exports.findByEmail = void 0;
const prisma_1 = require("../../lib/prisma");
const findByEmail = (email) => {
    return prisma_1.prisma.user.findUnique({ where: { email } });
};
exports.findByEmail = findByEmail;
const findById = (id) => {
    return prisma_1.prisma.user.findUnique({ where: { id } });
};
exports.findById = findById;
const createUser = (data) => {
    return prisma_1.prisma.user.create({ data });
};
exports.createUser = createUser;
const updateLastLogin = (id) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { lastLogin: new Date() },
    });
};
exports.updateLastLogin = updateLastLogin;
const saveRefreshToken = (userId, token) => {
    return prisma_1.prisma.refreshToken.create({
        data: {
            userId,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
};
exports.saveRefreshToken = saveRefreshToken;
const findRefreshToken = (token) => {
    return prisma_1.prisma.refreshToken.findUnique({ where: { token } });
};
exports.findRefreshToken = findRefreshToken;
const revokeRefreshToken = (token) => {
    return prisma_1.prisma.refreshToken.update({
        where: { token },
        data: { revoked: true },
    });
};
exports.revokeRefreshToken = revokeRefreshToken;
//# sourceMappingURL=authRepository.js.map