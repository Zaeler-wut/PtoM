import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Modal } from "../../components/shared/Modal";
import { FormInput } from "../../components/shared/FormInput";
import {
  RiAddLine, RiEditLine, RiDeleteBinLine, RiHome2Line,
  RiFlashlightLine, RiWaterFlashLine,
  RiCheckboxCircleLine, RiStarLine, RiCalendarCheckLine, RiUserLine,
} from "react-icons/ri";

// ── Types ──────────────────────────────────────────────────────────────────
interface Fee { name: string; price: number; }
interface RoomTypeForm {
  name: string;
  description: string;
  size: number;
  maxOccupants: number;
  roomPrice: number;
  furniturePrice: number;
  waterRate: number;
  electricRate: number;
  bookingFee: number;
  advanceRent: number;
  securityDeposit: number;
  fees: Fee[];
  facilities: string[];
  allowOnlineBooking: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_ROOM_TYPES = [
  {
    id: "1", name: "Standard", badge: "เปิดให้จอง", badgeColor: "bg-green-100 text-green-700",
    description: "ห้องพักมาตรฐาน เหมาะสำหรับผู้ที่ต้องการที่พักแบบเรียบง่าย",
    roomCount: 12, maxOccupants: 1, size: 12,
    roomPrice: 3000, furniturePrice: 500, waterRate: 18, electricRate: 7,
    bookingFee: 1000, advanceRent: 3000, securityDeposit: 3000,
    fees: [{ name: "ค่าส่วนกลาง", price: 200 }, { name: "ค่าขยะ", price: 40 }],
    facilities: ["พัดลม", "ห้องน้ำในตัว", "เตียง", "ตู้เสื้อผ้า"],
    summary: { roomPrice: 3000, furniturePrice: 500, waterRate: 200, electricRate: 840, total: 3740 },
    allowOnlineBooking: true,
  },
  {
    id: "2", name: "Deluxe", badge: "ปิดให้จอง", badgeColor: "bg-green-100 text-green-700",
    description: "ห้องพักระดับดีลักซ์ พร้อมสิ่งอำนวยความสะดวกครบครัน",
    roomCount: 16, maxOccupants: 2, size: 16,
    roomPrice: 4500, furniturePrice: 800, waterRate: 18, electricRate: 7,
    bookingFee: 1000, advanceRent: 4500, securityDeposit: 4500,
    fees: [{ name: "ค่าส่วนกลาง", price: 200 }, { name: "ค่าขยะ", price: 40 }],
    facilities: ["เครื่องปรับอากาศ", "ส้วมน้ำไหล", "เครื่องทำน้ำอุ่น", "เตียง", "ตู้เสื้อผ้า", "ทีวี-กาน้ำ"],
    summary: { roomPrice: 4500, furniturePrice: 800, waterRate: 200, electricRate: 840, total: 5540 },
    allowOnlineBooking: false,
  },
  {
    id: "3", name: "Suite", badge: "ปิดให้จอง", badgeColor: "bg-green-100 text-green-700",
    description: "ห้องพักขนาดใหญ่ พร้อมมิวส์ สิ่งอำนวยความสะดวกและความสะดวกสบายสูงสุด",
    roomCount: 20, maxOccupants: 2, size: 20,
    roomPrice: 6000, furniturePrice: 1000, waterRate: 18, electricRate: 7,
    bookingFee: 1500, advanceRent: 6000, securityDeposit: 6000,
    fees: [{ name: "ค่าส่วนกลาง", price: 200 }, { name: "ค่าขยะ", price: 40 }, { name: "ค่าที่จอดรถและอุปกรณ์กาน้ำ", price: 150 }],
    facilities: ["เครื่องปรับอากาศ", "ส้วมน้ำไหล", "เครื่องทำน้ำอุ่น", "เตียง", "ตู้เสื้อผ้า", "ทีวี-กาน้ำ", "ตู้เย็น", "อ่างอาบน้ำ"],
    summary: { roomPrice: 6000, furniturePrice: 1000, waterRate: 200, electricRate: 840, total: 7390 },
    allowOnlineBooking: true,
  },
];

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RoomTypePage() {
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState<typeof MOCK_ROOM_TYPES[0] | null>(null);

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าประเภทห้องและราคา</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการประเภทห้องพักและกำหนดอัตราค่าบริการต่างๆ</p>
        </div>

        <button onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors mb-6">
          <RiAddLine size={16} /> เพิ่มประเภทห้อง
        </button>

        <div className="space-y-6">
          {MOCK_ROOM_TYPES.map((rt) => (
            <RoomTypeCard key={rt.id} roomType={rt} onEdit={() => setEditItem(rt)} />
          ))}
        </div>
      </div>

      <RoomTypeModal open={addModal} onClose={() => setAddModal(false)} mode="add" />
      {editItem && (
        <RoomTypeModal open={!!editItem} onClose={() => setEditItem(null)} mode="edit" defaultValues={editItem} />
      )}
    </div>
  );
}

// ── Room Type Card ─────────────────────────────────────────────────────────
function RoomTypeCard({ roomType: rt, onEdit }: { roomType: typeof MOCK_ROOM_TYPES[0]; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">{rt.name}</h2>
          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${rt.badgeColor}`}>
            <RiCheckboxCircleLine size={12} />{rt.badge}
          </span>
        </div>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <RiEditLine size={13} /> แก้ไข
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">{rt.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* คิดในบิลทุกเดือน */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-1.5 mb-3">
            <RiCalendarCheckLine className="text-green-600" size={20} />
            <span className="text-base font-semibold text-green-900">คิดในบิลทุกเดือน</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-green-900">ค่าเช่า:</span><span className="text-base font-medium text-green-900">฿{rt.roomPrice.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-green-900">ค่าเฟอร์นิเจอร์:</span><span className="text-base font-medium text-green-900">฿{rt.furniturePrice}</span></div>
            <div className="flex justify-between"><span className="text-green-900">ค่าน้ำมาก:</span><span className="text-base font-medium text-green-900">฿200</span></div>
            <div className="flex justify-between"><span className="text-green-900">ค่าไฟ:</span><span className="text-base font-medium text-green-900">฿40</span></div>
            <div className="flex justify-between border-t-2 border-green-300 pt-1.5 mt-1.5">
              <span className="text-base font-semibold text-green-900">รวม/เดือน:</span>
              <span className="text-lg font-bold text-green-900">฿{rt.summary.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* อัตราสาธารณูปโภค */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-base font-semibold text-gray-700">ค่าสาธารณูปโภค</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiWaterFlashLine className="text-blue-500" size={16} />
                <span className="text-gray-600">ค่าน้ำ:</span>
              </div>
              <span className="text-gray-900 text-base">฿{rt.waterRate}/หน่วย</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiFlashlightLine className="text-yellow-500" size={16} />
                <span className="text-gray-600">ค่าไฟ:</span>
              </div>
              <span className="text-gray-900 text-base">฿{rt.electricRate}/หน่วย</span>
            </div>
          </div>
        </div>

        {/* ค่าใช้จ่ายก่อนเข้าอยู่ */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-base font-semibold text-gray-700">ค่าใช้จ่ายก่อนเข้าอยู่</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">เงินจอง:</span><span className="text-base text-gray-900">฿{rt.bookingFee.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">ค่าเช่าล่วงหน้า:</span><span className="text-base text-gray-900">฿{rt.advanceRent.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">ประกันความเสียหาย:</span><span className="text-base text-gray-900">฿{rt.securityDeposit.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-4 text-sm text-gray-800">
          <span className="flex items-center gap-1.5">
            <RiHome2Line size={14} />
            <span>{rt.size} ตร.ม.</span>
          </span>
          <span className="flex items-center gap-1.5">
            <RiUserLine size={14} />
            <span>สูงสุด {rt.maxOccupants} คน</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-800">
          <RiStarLine size={14} className="text-gray-800 flex-shrink-0" />
          <span>สิ่งอำนวยความสะดวก:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rt.facilities.map((f) => (
            <span key={f} className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 text-xs rounded-full">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Room Type Modal ────────────────────────────────────────────────────────
function RoomTypeModal({ open, onClose, mode, defaultValues }: {
  open: boolean; onClose: () => void;
  mode: "add" | "edit";
  defaultValues?: typeof MOCK_ROOM_TYPES[0];
}) {
  const [facilityInput, setFacilityInput] = useState("");
  const [facilities, setFacilities] = useState<string[]>(defaultValues?.facilities ?? []);
  const [allowOnlineBooking, setAllowOnlineBooking] = useState(defaultValues?.allowOnlineBooking ?? false);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<RoomTypeForm>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      size: defaultValues?.size ?? 12,
      maxOccupants: defaultValues?.maxOccupants ?? 1,
      roomPrice: defaultValues?.roomPrice ?? 0,
      furniturePrice: defaultValues?.furniturePrice ?? 0,
      waterRate: defaultValues?.waterRate ?? 18,
      electricRate: defaultValues?.electricRate ?? 7,
      bookingFee: defaultValues?.bookingFee ?? 0,
      advanceRent: defaultValues?.advanceRent ?? 0,
      securityDeposit: defaultValues?.securityDeposit ?? 0,
      fees: defaultValues?.fees ?? [],
      allowOnlineBooking: defaultValues?.allowOnlineBooking ?? false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fees" });

  const roomPrice = watch("roomPrice") || 0;
  const furniturePrice = watch("furniturePrice") || 0;
  const fees = watch("fees") || [];
  const totalFees = fees.reduce((s, f) => s + Number(f.price || 0), 0);
  const totalService = Number(roomPrice) + Number(furniturePrice) + totalFees;

  const addFacility = () => {
    const v = facilityInput.trim();
    if (v && !facilities.includes(v)) { setFacilities((p) => [...p, v]); setFacilityInput(""); }
  };

  const onSubmit = (data: RoomTypeForm) => {
    console.log({ ...data, facilities, allowOnlineBooking });
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}
      title={mode === "add" ? "เพิ่มประเภทห้องใหม่" : "แก้ไขประเภทห้อง"}
      description="กรอกข้อมูลประเภทห้องพักและอัตราค่าบริการต่างๆ"
      size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">

        {/* ข้อมูลพื้นฐาน */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 pb-3 border-b border-gray-200">
            ข้อมูลพื้นฐาน
          </h4>
          <div className="space-y-3">
            <FormInput label="ชื่อประเภทห้อง" placeholder="เช่น Standard, Deluxe"
              labelClassName="text-sm font-semibold text-gray-800"
              error={errors.name?.message}
              {...register("name", { required: "กรุณากรอกชื่อประเภทห้อง" })} />
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">รายละเอียด</label>
              <textarea rows={2} placeholder="รายละเอียดห้อง..."
                {...register("description")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="ขนาดห้อง (ตร.ม.)" type="number"
                labelClassName="text-base font-semibold text-gray-800"
                {...register("size")} />
              <FormInput label="จำนวนผู้พักสูงสุด" type="number"
                labelClassName="text-base font-semibold text-gray-800"
                {...register("maxOccupants")} />
            </div>
          </div>
        </div>

        {/* ค่าใช้จ่ายที่ต้องจ่ายในทุกเดือน */}
        <div className="border border-green-200 rounded-xl p-4 space-y-3 bg-green-50">
          <div className="flex items-center gap-3 pb-3 border-b border-green-200">
            <div className="flex items-center gap-2">
              <RiCalendarCheckLine size={20} className="text-green-600" />
              <h4 className="text-sm font-bold text-green-800">ค่าใช้จ่ายที่ต้องจ่ายในทุกเดือน</h4>
            </div>
            <span className="text-sm font-semibold px-3 py-1 bg-green-600 text-white rounded-full">รายเดือน</span>
          </div>
          <FormInput label="ค่าห้อง (฿)" type="number"
            labelClassName="font-semibold text-green-900"
            inputClassName="border-green-300 focus:border-green-400"
            {...register("roomPrice")} />
          <FormInput label="ค่าเฟอร์นิเจอร์ (฿/เดือน)" type="number"
            labelClassName="font-semibold text-green-900"
            inputClassName="border-green-300 focus:border-green-400"
            {...register("furniturePrice")} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-green-900">ค่าบริการคงที่ (฿/เดือน)</label>
              <button type="button" onClick={() => append({ name: "", price: 0 })}
                className="flex items-center gap-1 text-sm px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <RiAddLine size={16} /> เพิ่มรายการ
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input placeholder="รายการ" {...register(`fees.${i}.name`)}
                    className="flex-1 px-3 py-2 text-sm border border-green-300 rounded-lg outline-none focus:border-green-500 bg-white" />
                  <input type="number" placeholder="ราคา (฿)" {...register(`fees.${i}.price`)}
                    className="w-28 px-3 py-2 text-sm border border-green-300 rounded-lg outline-none focus:border-green-500 bg-white" />
                  <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2">
                    <RiDeleteBinLine size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-green-900">รวมค่าบริการคงที่:</span>
            <span className="text-sm font-bold text-green-700">฿{totalService.toLocaleString()}</span>
          </div>
        </div>

        {/* อัตราสาธารณูปโภค */}
        <div className="border border-blue-300 rounded-xl p-4 space-y-3 bg-blue-50">
          <div className="flex items-center gap-1.5">
            <RiWaterFlashLine size={20} className="text-blue-500" />
            <RiFlashlightLine size={20} className="text-yellow-500" />
            <span className="text-sm font-semibold text-blue-900">อัตราสาธารณูปโภค (คิดตามการใช้)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput type="number"
              label="ค่าน้ำ (฿/หน่วย)"
              labelClassName="text-blue-900 flex items-center gap-1.5"
              inputClassName="border-blue-300 focus:border-blue-400"
              {...register("waterRate")} />
            <FormInput type="number"
              label="ค่าไฟ (฿/หน่วย)"
              labelClassName="text-blue-900 flex items-center gap-1.5"
              inputClassName="border-blue-300 focus:border-blue-400"
              {...register("electricRate")} />
          </div>
        </div>

        {/* ค่าใช้จ่ายก่อนเข้าอยู่ */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 pb-3 border-b border-gray-200">
            ค่าใช้จ่ายก่อนเข้าอยู่
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="เงินมัดจำการจอง (฿)" type="number"
                labelClassName="text-base font-semibold text-gray-800"
                {...register("bookingFee")} />
              <FormInput label="ค่าเช่าล่วงหน้า (฿)" type="number"
                labelClassName="text-base font-semibold text-gray-800"
                {...register("advanceRent")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="ประกันความเสียหาย (฿)" type="number"
                labelClassName="text-base font-semibold text-gray-800"
                {...register("securityDeposit")} />
            </div>
          </div>
        </div>

        {/* สิ่งอำนวยความสะดวก */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <RiStarLine size={14} /> สิ่งอำนวยความสะดวกภายในห้อง
          </h4>
          <div className="flex gap-2 mb-2">
            <input type="text" value={facilityInput} onChange={(e) => setFacilityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
              placeholder="เช่น เครื่องปรับอากาศ, เตียง, ตู้เสื้อผ้า"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
            <button type="button" onClick={addFacility}
              className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              + เพิ่ม
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {facilities.map((f) => (
              <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 text-xs rounded-full">
                {f}
                <button type="button" onClick={() => setFacilities((p) => p.filter((x) => x !== f))}
                  className="text-orange-700 hover:text-orange-900 text-base leading-none">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* เปิดให้จองผ่าน App */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">เปิดให้จองผ่าน App</p>
            <p className="text-xs text-gray-400">อนุญาตให้ผู้ใช้จองห้องประเภทนี้ผ่านแอปได้โดยตรง</p>
          </div>
          <button type="button" onClick={() => setAllowOnlineBooking((v) => !v)}
            className={`relative inline-flex w-12 h-6 rounded-full transition-colors flex-shrink-0 ${allowOnlineBooking ? "bg-purple-600" : "bg-gray-300"}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${allowOnlineBooking ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit"
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
            {mode === "add" ? "เพิ่มประเภทห้อง" : "บันทึกการแก้ไข"}
          </button>
        </div>

      </form>
    </Modal>
  );
}