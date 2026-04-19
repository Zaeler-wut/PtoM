"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRouter_1 = __importDefault(require("./modules/auth/authRouter"));
const propertyRouter_1 = __importDefault(require("./modules/property/propertyRouter"));
const roomRouter_1 = __importDefault(require("./modules/room/roomRouter"));
const bookingRouter_1 = __importDefault(require("./modules/booking/bookingRouter"));
const contractRouter_1 = __importDefault(require("./modules/contract/contractRouter"));
const tenantRouter_1 = __importDefault(require("./modules/tenant/tenantRouter"));
const billingRouter_1 = __importDefault(require("./modules/billing/billingRouter"));
const moveOutRouter_1 = __importDefault(require("./modules/moveout/moveOutRouter"));
const dashboardRouter_1 = __importDefault(require("./modules/dashboard/dashboardRouter"));
const uploadRouter_1 = __importDefault(require("./modules/upload/uploadRouter"));
const propertyRouter_2 = __importDefault(require("./modules-mobile/property/propertyRouter"));
const meterRouter_1 = __importDefault(require("./modules-mobile/meter/meterRouter"));
const profileRouter_1 = __importDefault(require("./modules-mobile/profile/profileRouter"));
const bookingRouter_2 = __importDefault(require("./modules-mobile/booking/bookingRouter"));
const billRouter_1 = __importDefault(require("./modules-mobile/billing/billRouter"));
const contractRouter_2 = __importDefault(require("./modules-mobile/contract/contractRouter"));
const superadminRouter_1 = __importDefault(require("./modules/superadmin/superadminRouter"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use((0, cookie_parser_1.default)());
console.log("uploadRouter loaded:", uploadRouter_1.default); // ← เพิ่ม
app.use("/api/upload", uploadRouter_1.default);
app.get("/api/upload/test", (req, res) => {
    res.json({ ok: true });
});
app.use("/api/auth", authRouter_1.default);
app.use("/api/admin", propertyRouter_1.default);
app.use("/api/admin", roomRouter_1.default);
app.use("/api/admin", bookingRouter_1.default);
app.use("/api/admin", contractRouter_1.default);
app.use("/api/admin", tenantRouter_1.default);
app.use("/api/admin", billingRouter_1.default);
app.use("/api/admin", moveOutRouter_1.default);
app.use("/api/admin", dashboardRouter_1.default);
app.use("/api/mobile", propertyRouter_2.default);
app.use("/api/mobile", meterRouter_1.default);
app.use("/api/mobile", profileRouter_1.default);
app.use("/api/mobile", bookingRouter_2.default);
app.use("/api/mobile", billRouter_1.default);
app.use("/api/mobile", contractRouter_2.default);
app.use("/api/superadmin", superadminRouter_1.default);
app.listen(port, () => {
    console.log(`Server is running on http:localhost:${port}`);
});
//# sourceMappingURL=index.js.map