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
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const service = __importStar(require("./superadminService"));
const getRequesterId = (req) => req.user.id;
const router = express_1.default.Router();
const guard = [authenticate_1.authenticate, (0, authorize_1.authorize)("SUPERADMIN")];
// Dashboard
router.get("/dashboard", ...guard, async (_req, res) => {
    try {
        res.json(await service.getDashboard());
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ── Admins ───────────────────────────────────────────────────
router.get("/admins", ...guard, async (_req, res) => {
    try {
        res.json(await service.getAdmins());
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/admins", ...guard, async (req, res) => {
    try {
        const data = await service.createAdmin(req.body);
        res.status(201).json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.patch("/admins/:id/limit", ...guard, async (req, res) => {
    try {
        const data = await service.updateLimit(req.params.id, parseInt(req.body.propertyLimit));
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.patch("/admins/:id/status", ...guard, async (req, res) => {
    try {
        const data = await service.setStatus(req.params.id, req.body.isActive);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/admins/:id/reset-password", ...guard, async (req, res) => {
    try {
        await service.resetPassword(req.params.id, req.body.password);
        res.json({ message: "Password reset successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete("/admins/:id", ...guard, async (req, res) => {
    try {
        await service.deleteAdmin(req.params.id, getRequesterId(req), req.body.password);
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Impersonate
router.post("/admins/:id/impersonate", ...guard, async (req, res) => {
    try {
        const data = await service.impersonate(req.params.id);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ── Properties ───────────────────────────────────────────────
router.get("/properties", ...guard, async (_req, res) => {
    try {
        res.json(await service.getProperties());
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ── Users (Support) ──────────────────────────────────────────
router.get("/users/search", ...guard, async (req, res) => {
    try {
        const data = await service.searchUsers(req.query.q);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.patch("/users/:id/status", ...guard, async (req, res) => {
    try {
        const data = await service.setStatus(req.params.id, req.body.isActive);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/users/:id/reset-password", ...guard, async (req, res) => {
    try {
        await service.resetPassword(req.params.id, req.body.password);
        res.json({ message: "Password reset successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete("/users/:id", ...guard, async (req, res) => {
    try {
        await service.deleteUserAccount(req.params.id, getRequesterId(req), req.body.password);
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=superadminRouter.js.map