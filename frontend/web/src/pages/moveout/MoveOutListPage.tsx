import { useState } from "react";
import { Modal } from "../../components/shared/Modal";
import { FormInput } from "../../components/shared/FormInput";
import { SummaryRow } from "../../components/moveout/SummaryRow";
import { AddItemSection } from "../../components/moveout/AddItemSection";
import {
  RiAddLine, RiCalendarLine, RiUser3Line, RiHome2Line,
  RiPhoneLine, RiCheckboxCircleLine, RiDeleteBinLine, RiFileTextLine,
} from "react-icons/ri";

// ── Types ──────────────────────────────────────────────────────────────────
interface DamageItem { name: string; amount: number; }
interface ExtraItem { name: string; amount: number; }

interface MoveOutTenant {
  id: string;
  name: string;
  room: string;
  roomType: string;
  phone: string;
  moveOutDate: string;
  status: "รอดำเนินการ" | "เสร็จสิ้น";
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_TENANTS: MoveOutTenant[] = [
  {
    id: "1", name: "วิชัย มั่นคง", room: "201", roomType: "Standard",
    phone: "083-456-7890", moveOutDate: "15/2/2568", status: "รอดำเนินการ",
  },
];

// ── Main Page ──────────────────────────────────────────────────────────────
export default function MoveOutListPage() {
  const [createModal, setCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<MoveOutTenant | null>(null);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">บิลแจ้งออก</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการบิลสำหรับผู้ที่แจ้งออก คำนวณการคืนเงินมัดจำ และหักค่าเสียหาย</p>
        </div>

        {/* Info Banner */}
        <div className="bg-white rounded-2xl border border-blue-300 shadow-sm p-6 mb-6 flex items-start gap-3 max-w-6xl">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold leading-none">!</span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">ขั้นตอนการแจ้งออก</p>
            <p className="text-sm text-gray-600 mt-0.5">บันทึกค่าเสียหาย (ถ้ามี) และระบบจะคำนวณเงินคืนมัดจำโดยอัตโนมัติ</p>
          </div>
        </div>

        {/* Create Button */}
        <button onClick={() => setSelectedTenant(MOCK_TENANTS[0])}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors mb-6">
          <RiAddLine size={16} /> สร้างบิลแจ้งออก
        </button>

        {/* Tenant List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 max-w-6xl">
          <div className="px-4 py-2">
            <h3 className="text-base font-semibold text-gray-700">รายการรอแจ้งออก</h3>
          </div>
          <div className="px-4 pb-6 space-y-3">
            {MOCK_TENANTS.map((t) => (
              <div key={t.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-5 mt-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <RiUser3Line className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>ห้อง {t.room}</span>
                      <span>•</span>
                      <span>{t.roomType}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><RiPhoneLine size={12} /> โทร: {t.phone}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><RiCalendarLine size={12} /> ย้ายออกวันที่: {t.moveOutDate}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTenant(t)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
                  <RiFileTextLine size={13} /> สร้างบิลแจ้งออก
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateMoveOutModal open={createModal} onClose={() => setCreateModal(false)} />

      {/* Bill Modal */}
      {selectedTenant && (
        <MoveOutBillModal
          open={!!selectedTenant}
          onClose={() => setSelectedTenant(null)}
          tenant={selectedTenant}
        />
      )}
    </div>
  );
}

// ── Create Move Out Modal ──────────────────────────────────────────────────
function CreateMoveOutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}
      title="สร้างบิลแจ้งออก" description="บันทึกข้อมูลการแจ้งออกและคำนวณเงินคืนมัดจำ" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">เลือกผู้เช่า</label>
          <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white">
            <option>เลือกผู้เช่าที่แจ้งออก</option>
            <option>วิชัย มั่นคง — ห้อง 201</option>
          </select>
        </div>
        <FormInput label="วันที่แจ้งออก" type="text" placeholder="วัน/เดือน/ปี" />
        <FormInput label="เงินประกัน + ล่วงหน้า 1 เดือน (บาท)" type="number" placeholder="3000" />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
            สร้างบิล
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Move Out Bill Modal ────────────────────────────────────────────────────
function MoveOutBillModal({ open, onClose, tenant }: {
  open: boolean; onClose: () => void; tenant: MoveOutTenant;
}) {
  const [damageItems, setDamageItems] = useState<DamageItem[]>([]);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [waterPrev, setWaterPrev] = useState("1580");
  const [waterCurr, setWaterCurr] = useState("1580");
  const [electricPrev, setElectricPrev] = useState("6240");
  const [electricCurr, setElectricCurr] = useState("6240");
  const [billStart, setBillStart] = useState("1");
  const [billEnd, setBillEnd] = useState("15");

  const roomPrice = 3000;
  const furniturePrice = 500;
  const commonFee = 200;
  const trashFee = 40;
  const waterRate = 18;
  const electricRate = 7;
  const deposit = 6000;

  const waterUsed = Math.max(0, Number(waterCurr) - Number(waterPrev));
  const electricUsed = Math.max(0, Number(electricCurr) - Number(electricPrev));
  const waterCost = waterUsed * waterRate;
  const electricCost = electricUsed * electricRate;
  const totalBill = roomPrice + furniturePrice + commonFee + trashFee + waterCost + electricCost;
  const totalDamage = damageItems.reduce((s, i) => s + i.amount, 0);
  const totalExtra = extraItems.reduce((s, i) => s + i.amount, 0);
  const refund = deposit - totalBill - totalDamage - totalExtra;

  const addDamage = () => setDamageItems((p) => [...p, { name: "รายการเสียหาย", amount: 0 }]);
  const addExtra = () => setExtraItems((p) => [...p, { name: "รายการเพิ่มเติม", amount: 0 }]);

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}
      title="สร้างบิลแจ้งออก" description="บันทึกข้อมูลการแจ้งออกและคำนวณเงินคืนมัดจำ" size="xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

        {/* เลือกผู้เช่า + วันที่แจ้งออก */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เลือกผู้เช่า</label>
            <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white">
              <option>เลือกผู้เช่าที่แจ้งออก</option>
              <option selected>{tenant.name} (ห้อง {tenant.room})</option>
            </select>
          </div>
          <FormInput label="วันที่แจ้งออก" type="text" defaultValue="15/2/2026" />
        </div>

        {/* สถานะสัญญา + ระยะเวลาที่อยู่ */}
        <div className="border border-blue-200 rounded-xl p-4 space-y-4 bg-blue-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะสัญญา</label>
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                อยู่ระหว่างสัญญา
              </span>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ระยะเวลาที่อยู่</label>
              12 เดือน
          </div>
        </div>

        {/* เงินประกัน */}
        <FormInput label="เงินประกัน + ล่วงหน้า 1 เดือน (บาท)" type="number" defaultValue="6000" />

        {/* บิลเดือนล่าสุด */}
        <div className="border border-blue-200 rounded-xl p-4 space-y-4 bg-blue-50">
          <div className="flex items-center gap-2">
            <RiCalendarLine className="text-blue-500" size={16} />
            <h4 className="text-sm font-bold text-blue-800">บิลเดือนล่าสุด (มีนาคม 2026)</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput label="วันที่เริ่มรอบบิล" type="text" value={billStart}
              inputClassName="border-blue-200 focus:border-blue-400"
              onChange={(e) => setBillStart(e.target.value)} />
            <FormInput label="วันสิ้นสุดรอบบิล" type="text" value={billEnd}
              inputClassName="border-blue-200 focus:border-blue-400"
              onChange={(e) => setBillEnd(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <span className="text-yellow-500 text-xs">⚠</span>
            <span className="text-xs text-yellow-700">คำนวณเป็นรายวัน (15 วัน จาก 31 วัน)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput label="ค่าห้อง (บาท)" type="number" defaultValue={String(roomPrice)}
              inputClassName="border-blue-200 focus:border-blue-400" />
            <FormInput label="ค่าเฟอร์นิเจอร์ (บาท)" type="number" defaultValue={String(furniturePrice)}
              inputClassName="border-blue-200 focus:border-blue-400" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormInput label="มิเตอร์น้ำเดิม" type="number" value={waterPrev}
              inputClassName="border-blue-200 focus:border-blue-400"
              onChange={(e) => setWaterPrev(e.target.value)} />
            <FormInput label="มิเตอร์น้ำใหม่ *" type="number" value={waterCurr}
              inputClassName="border-blue-200 focus:border-blue-400"
              onChange={(e) => setWaterCurr(e.target.value)} />
            <FormInput label="ราคาต่อหน่วย" type="number" defaultValue={String(waterRate)}
              inputClassName="border-blue-200 focus:border-blue-400" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormInput label="มิเตอร์ไฟเดิม" type="number" value={electricPrev}
              inputClassName="border-blue-200 focus:border-blue-400"
              onChange={(e) => setElectricPrev(e.target.value)} />
            <FormInput label="มิเตอร์ไฟใหม่ *" type="number" value={electricCurr}
              inputClassName="border-blue-200 focus:border-blue-400"
              onChange={(e) => setElectricCurr(e.target.value)} />
            <FormInput label="ราคาต่อหน่วย" type="number" defaultValue={String(electricRate)}
              inputClassName="border-blue-200 focus:border-blue-400" />
          </div>

          <div className="bg-white rounded-xl p-3 space-y-1.5 border border-blue-100">
            <SummaryRow label="ค่าห้อง (คำนวณรายวัน)" value={`฿${roomPrice.toLocaleString()}`} />
            <SummaryRow label="ค่าเฟอร์นิเจอร์ (คำนวณรายวัน)" value={`฿${furniturePrice}`} />
            <SummaryRow label="ค่าส่วนกลาง" value={`฿${commonFee}`} />
            <SummaryRow label="ค่าขยะ" value={`฿${trashFee}`} />
            <SummaryRow label={`ค่าน้ำ (${waterUsed} หน่วย)`} value={`฿${waterCost}`} />
            <SummaryRow label={`ค่าไฟ (${electricUsed} หน่วย)`} value={`฿${electricCost}`} />
            <SummaryRow label="รวมบิลเดือนล่าสุด" value={`฿${totalBill.toLocaleString()}`}
              bold borderTop valueColor="text-blue-700" />
          </div>
        </div>

        {/* รายการหักค่าเสียหาย */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">รายการหักค่าเสียหาย</span>
            <button type="button" onClick={addDamage}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <RiAddLine size={13} /> เพิ่มรายการ
            </button>
          </div>
          {damageItems.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-lg px-4 py-4 text-center">
              <p className="text-xs text-gray-400">ไม่มีค่าเสียหาย</p>
            </div>
          ) : (
            <div className="space-y-2">
              {damageItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input defaultValue={item.name}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                  <input type="number" defaultValue={item.amount}
                    className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                  <button type="button" onClick={() => setDamageItems((p) => p.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 px-1">
                    <RiDeleteBinLine size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* รายการค่าใช้จ่ายเพิ่มเติม */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">รายการค่าใช้จ่ายเพิ่มเติม</span>
            <button type="button" onClick={addExtra}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <RiAddLine size={13} /> เพิ่มรายการ
            </button>
          </div>
          {extraItems.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-lg px-4 py-4 text-center">
              <p className="text-xs text-gray-400">ไม่มีรายการค่าใช้จ่ายเพิ่มเติม</p>
            </div>
          ) : (
            <div className="space-y-2">
              {extraItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input defaultValue={item.name}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                  <input type="number" defaultValue={item.amount}
                    className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                  <button type="button" onClick={() => setExtraItems((p) => p.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 px-1">
                    <RiDeleteBinLine size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* สรุปยอดเงินคืน */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <h4 className="text-sm font-bold text-gray-800 mb-3">สรุปยอดเงินคืน</h4>
          <SummaryRow label="เงินมัดจำ" value={`฿${deposit.toLocaleString()}`} valueColor="text-green-600" bold />
          <SummaryRow label="หักบิลเดือนล่าสุด" value={`-฿${totalBill.toLocaleString()}`} valueColor="text-red-500" />
          {totalDamage > 0 && (
            <SummaryRow label="หักค่าเสียหาย" value={`-฿${totalDamage.toLocaleString()}`} valueColor="text-red-500" />
          )}
          {totalExtra > 0 && (
            <SummaryRow label="หักค่าใช้จ่ายเพิ่มเติม" value={`-฿${totalExtra.toLocaleString()}`} valueColor="text-red-500" />
          )}
          <div className="border-t-2 border-gray-200 pt-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">ยอดเงินคืน</span>
              <span className={`text-2xl font-bold ${refund >= 0 ? "text-green-600" : "text-red-500"}`}>
                ฿{refund.toLocaleString()}.00
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
            <RiCheckboxCircleLine size={16} /> ยืนยันแจ้งออก
          </button>
        </div>

      </div>
    </Modal>
  );
}