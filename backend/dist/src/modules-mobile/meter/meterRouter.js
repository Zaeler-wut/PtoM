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
const service = __importStar(require("./meterService"));
const authenticate_1 = require("../../middlewares/authenticate");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
function getAnthropicClient() {
    return new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 90000 });
}
const router = express_1.default.Router();
// ดึง properties ที่ admin คนนี้ดูแล
router.get("/admin/properties", authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await service.getAdminProperties(userId);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ดึงห้องทั้งหมดใน property พร้อมข้อมูลมิเตอร์เดือนนั้น
router.get("/admin/properties/:propertyId/rooms", authenticate_1.authenticate, async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        const data = await service.getRoomsForMeter(propertyId, month, year);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// บันทึกมิเตอร์แต่ละห้อง
router.post("/admin/meter", authenticate_1.authenticate, async (req, res) => {
    try {
        const { roomId, month, year, waterMeter, electricMeter } = req.body;
        if (!roomId || !month || !year || waterMeter == null || electricMeter == null) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const data = await service.saveMeterReading({
            roomId,
            month: parseInt(month),
            year: parseInt(year),
            waterMeter: parseFloat(waterMeter),
            electricMeter: parseFloat(electricMeter),
        });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// AI อ่านมิเตอร์จากรูปภาพ
router.post("/admin/meter/ai-read", authenticate_1.authenticate, async (req, res) => {
    var _a, _b;
    try {
        const { images } = req.body;
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: "images array is required" });
        }
        const results = [];
        for (const img of images) {
            const prompt = img.type === 'electric'
                ? 'Read this electricity meter image. Extract room number and kWh reading.\n\n' +
                    'ORIENTATION: Find "kWh", "MITSUBISHI", or "IPG" text. If upside-down, flip mentally first.\n\n' +
                    'ROOM NUMBER: Find a sticker added to the meter body (not original part). Any color/shape, may have letters (A11, B3). Thai numerals → Arabic. No sticker → null.\n\n' +
                    'METER READING — two types:\n' +
                    '• Digital LCD (IPG/International Power Group): read the integer number shown on screen before "kWh". Example: "63 kWh" → 63\n' +
                    '• Analog roller wheels (Mitsubishi): read the 4 digits directly below the brand name. Ignore the decimal point and any digits after it. Example: "1741.0" → 1741\n\n' +
                    'STRICT RULE: If any digit is unclear, blurry, or partially obscured → set that value to null. DO NOT guess under any circumstances.\n\n' +
                    'Reply with a single JSON object and nothing else — no explanation, no markdown. Start your response with { directly.\n' +
                    'Format: {"roomNumber":"4","meterValue":63}'
                : 'อ่านค่ามิเตอร์น้ำจากภาพนี้\n\n' +
                    'ขั้นตอนที่ 1 — ปรับทิศทางภาพ:\n' +
                    '  มองหาข้อความ "หน่วยลูกบาศก์เมตร" หรือ "หน่วยลิตร" หรือ "DUSS"\n' +
                    '  ภาพอาจถูกหมุน 90° หรือ 180° ให้หมุนภาพในใจจนข้อความอ่านได้ปกติก่อนเสมอ\n\n' +
                    'ขั้นตอนที่ 2 — เลขห้อง:\n' +
                    '  มองหาสติ๊กเกอร์ที่ติดทีหลังบนหน้าปัด เช่น วงกลมสีแดงที่มีตัวเลขขนาดใหญ่อยู่ตรงกลาง\n' +
                    '  → roomNumber หรือ null ถ้าไม่มีสติ๊กเกอร์\n\n' +
                    'ขั้นตอนที่ 3 — อ่านค่า cubic meter:\n\n' +
                    '  โครงสร้างช่องตัวเลข (หลังปรับทิศแล้ว อ่านจากซ้ายไปขวา):\n' +
                    '    กล่องดำ 4 ช่อง = หน่วยลูกบาศก์เมตร  (พัน | ร้อย | สิบ | หน่วย)\n' +
                    '    กล่องแดง 3 ช่อง = หน่วยลิตร  ← ห้ามอ่านเด็ดขาด\n\n' +
                    '  วิธีอ่านที่ถูกต้อง:\n' +
                    '    1. ระบุกล่องดำทั้ง 4 ช่องให้ครบก่อน (แต่ละช่องแทน พัน-ร้อย-สิบ-หน่วย)\n' +
                    '    2. อ่านตัวเลขในกล่องดำทีละช่องตามลำดับ จะได้ตัวเลข 4 หลัก เช่น "0075"\n' +
                    '    3. แปลง 4 หลักนั้นเป็นจำนวนเต็ม: "0075" → cubic = 75\n' +
                    '    ⚠ ห้ามข้ามกล่องดำแม้จะเป็น 0 เพราะทุกช่องมีความหมาย\n' +
                    '    ⚠ ห้ามนับกล่องแดงรวมเข้ามา ไม่ว่าจะอยู่ชิดแค่ไหน\n\n' +
                    '  ตัวอย่าง:\n' +
                    '    [0][0][7][5](ดำ) | [6][3][?](แดง)  →  "0075" → cubic = 75\n' +
                    '    [0][1][7][8](ดำ) | [8][0][?](แดง)  →  "0178" → cubic = 178\n' +
                    '    [0][0][0][9](ดำ) | [5][0][0](แดง)  →  "0009" → cubic = 9\n' +
                    '    [0][0][0][0](ดำ) | [0][0][0](แดง)  →  "0000" → cubic = 0\n\n' +
                    '  กฎสุดท้าย: ถ้ากล่องดำช่องใดมองไม่ชัด/เบลอ/มีเงาบัง → cubic = null ห้ามเดา\n\n' +
                    'ตอบ JSON เท่านั้น เริ่มด้วย { ทันที ห้ามมี markdown หรือคำอธิบาย:\n' +
                    '{"roomNumber":"5","cubic":75}';
            try {
                const response = await getAnthropicClient().messages.create({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 150,
                    temperature: 0,
                    messages: [{
                            role: 'user',
                            content: [
                                { type: 'image', source: { type: 'base64', media_type: img.mimeType, data: img.base64 } },
                                { type: 'text', text: prompt },
                            ],
                        }],
                });
                const text = (_b = (_a = response.content.find(b => b.type === 'text')) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : '{}';
                const jsonMatches = text.match(/\{[^{}]*\}/g);
                const clean = jsonMatches ? jsonMatches[jsonMatches.length - 1] : '{}';
                const parsed = JSON.parse(clean);
                const roomNumber = parsed.roomNumber != null ? String(parsed.roomNumber).trim() : null;
                let meterValue = null;
                if (parsed.cubic != null) {
                    meterValue = Math.floor(Number(parsed.cubic));
                    if (meterValue >= 10000) {
                        meterValue = Math.floor(meterValue / Math.pow(10, Math.floor(Math.log10(meterValue)) - 3));
                    }
                }
                else if (parsed.meterValue != null) {
                    meterValue = Math.floor(Number(parsed.meterValue));
                }
                results.push({ roomNumber, meterValue, type: img.type });
            }
            catch (_c) {
                results.push({ roomNumber: null, meterValue: null, type: img.type });
            }
        }
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=meterRouter.js.map