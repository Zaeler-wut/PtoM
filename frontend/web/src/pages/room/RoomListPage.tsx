import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../../components/shared/Modal";
import { FormInput } from "../../components/shared/FormInput";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { SelectInput } from "../../components/shared/SelectInput";
import { useToast } from "../../components/shared/Toast";
import { RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiLineChartLine, RiDropLine, RiFlashlightLine } from "react-icons/ri";
import { getRooms, createRoom, updateRoom, getMeterHistory, type Room, type RoomStatus, type MeterReading } from "../../api/room/roomApi";
import { getRoomTypes, type RoomType } from "../../api/room/roomTypeApi";

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "OCCUPIED", label: "มีผู้เช่า" },
  { value: "RESERVED", label: "จอง" },
  { value: "PREPARING", label: "เตรียมว่าง" },
  { value: "MAINTENANCE", label: "ปรับปรุง" },
];

const STATUS_EDIT_OPTIONS = [
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "RESERVED", label: "จอง" },
  { value: "PREPARING", label: "เตรียมว่าง" },
  { value: "MAINTENANCE", label: "ปรับปรุง" },
];

// ── Form types ─────────────────────────────────────────────────────────────
interface AddRoomForm { roomNumber: string; floor: string; roomTypeId: string; }
interface EditRoomForm { roomNumber: string; floor: string; roomTypeId: string; status: RoomStatus; }

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RoomListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addModal, setAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [meterRoom, setMeterRoom] = useState<Room | null>(null);

  const fetchAll = async () => {
    if (!propertyId) return;
    setIsLoading(true);
    try {
      const [roomData, rtData] = await Promise.all([
        getRooms(propertyId),
        getRoomTypes(propertyId),
      ]);
      setRooms(roomData);
      setRoomTypes(rtData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [propertyId]);

  const filtered = rooms
    .filter((r) => {
      const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PREPARING"
          ? r.status === "PREPARING" || r.contractStatus === "MOVE_OUT_NOTICE"
          : r.status === statusFilter && r.contractStatus !== "MOVE_OUT_NOTICE");
      return matchSearch && matchStatus;
    })
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลห้องพักและสถานะ</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 bg-white border border-gray-300 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขห้อง..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 sm:min-w-[190px]">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={16} />
            <SelectInput
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              className="flex-1"
            />
          </div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
            <RiAddLine size={16} /> เพิ่มห้อง
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <p className="text-base font-semibold text-gray-700">
              รายการห้องทั้งหมด ({isLoading ? "..." : filtered.length})
            </p>
          </div>
          <div className="overflow-x-auto mx-4 sm:mx-7 mb-4 rounded-xl border border-gray-300 mt-3">
            <table className="w-full min-w-[600px]">
              <thead className="border-b border-gray-300 bg-gray-50/50">
                <tr>
                  {["เลขห้อง", "ชั้น", "ประเภทห้อง", "ราคา/เดือน", "สถานะ", "ผู้เช่า / วันที่แจ้งออก", "จัดการ"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-sm text-gray-400 text-center">ไม่พบห้อง</td></tr>
                ) : filtered.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{room.roomNumber}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{room.floor ?? "-"}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{room.roomType}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">฿{room.price.toLocaleString()}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        status={room.contractStatus === "MOVE_OUT_NOTICE" ? "PREPARING" : room.status}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-700">{room.tenant ?? "-"}</span>
                        {room.moveOutNoticeDate && (
                          <span className="text-xs text-orange-500">
                            แจ้งออก {new Date(room.moveOutNoticeDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditRoom(room)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          <RiEditLine size={13} /> แก้ไข
                        </button>
                        <button onClick={() => setMeterRoom(room)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          <RiLineChartLine size={13} /> ประวัติมิเตอร์
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddRoomModal open={addModal} onClose={() => setAddModal(false)}
        propertyId={propertyId!} roomTypes={roomTypes}
        onSuccess={() => { setAddModal(false); fetchAll(); toast("เพิ่มห้องสำเร็จ"); }} />

      {editRoom && (
        <EditRoomModal open room={editRoom} propertyId={propertyId!} roomTypes={roomTypes}
          onClose={() => setEditRoom(null)}
          onSuccess={() => { setEditRoom(null); fetchAll(); toast("แก้ไขห้องสำเร็จ"); }} />
      )}

      {meterRoom && propertyId && (
        <MeterHistoryModal
          room={meterRoom}
          propertyId={propertyId}
          onClose={() => setMeterRoom(null)}
        />
      )}
    </div>
  );
}

// ── Meter History Modal ────────────────────────────────────────────────────
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function MeterHistoryModal({ room, propertyId, onClose }: {
  room: Room; propertyId: string; onClose: () => void;
}) {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getMeterHistory(propertyId, room.id)
      .then(setReadings)
      .finally(() => setIsLoading(false));
  }, [propertyId, room.id]);

  return (
    <Modal open onOpenChange={(v) => { if (!v) onClose(); }}
      title={`ประวัติมิเตอร์ — ห้อง ${room.roomNumber}`} size="lg">
      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : readings.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">ยังไม่มีข้อมูลมิเตอร์</div>
      ) : (
        <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                {["เดือน/ปี", "มิเตอร์น้ำ", "มิเตอร์ไฟ"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {readings.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-700">
                    {THAI_MONTHS[r.month - 1]} {r.year + 543}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-blue-700">
                      <RiDropLine size={13} /> {r.waterMeter.toLocaleString()} หน่วย
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-yellow-600">
                      <RiFlashlightLine size={13} /> {r.electricMeter.toLocaleString()} หน่วย
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

// ── Add Room Modal ─────────────────────────────────────────────────────────
function AddRoomModal({ open, onClose, propertyId, roomTypes, onSuccess }: {
  open: boolean; onClose: () => void; propertyId: string; roomTypes: RoomType[]; onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<AddRoomForm>();

  const roomTypeOptions = roomTypes.map((rt) => ({
    value: rt.id, label: `${rt.name} — ฿${(rt.roomPrice + (rt.furniturePrice ?? 0)).toLocaleString()}/เดือน`,
  }));

  const onSubmit = async (data: AddRoomForm) => {
    try {
      await createRoom(propertyId, {
        roomNumber: data.roomNumber,
        roomTypeId: data.roomTypeId,
        floor: data.floor ? Number(data.floor) : undefined,
      });
      reset();
      onSuccess();
    } catch (err: any) {
      toast(err?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error");
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}
      title="เพิ่มห้อง" description="เพิ่มข้อมูลห้องพักใหม่" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="เลขห้อง" placeholder="เช่น 101, A201"
          error={errors.roomNumber?.message}
          {...register("roomNumber", { required: "กรุณากรอกเลขห้อง" })} />
        <FormInput label="ชั้น" type="number" placeholder="เช่น 1, 2, 3" {...register("floor")} />
        <Controller name="roomTypeId" control={control} rules={{ required: true }}
          render={({ field }) => (
            <SelectInput label="ประเภทห้อง" placeholder="เลือกประเภทห้อง..."
              value={field.value ?? ""} onValueChange={field.onChange} options={roomTypeOptions} />
          )} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { reset(); onClose(); }}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Room Modal ────────────────────────────────────────────────────────
function EditRoomModal({ open, room, propertyId, roomTypes, onClose, onSuccess }: {
  open: boolean; room: Room; propertyId: string; roomTypes: RoomType[]; onClose: () => void; onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<EditRoomForm>({
    defaultValues: {
      roomNumber: room.roomNumber,
      floor: room.floor != null ? String(room.floor) : "",
      roomTypeId: room.roomTypeId,
      status: room.status,
    },
  });

  const roomTypeOptions = roomTypes.map((rt) => ({
    value: rt.id, label: `${rt.name} — ฿${(rt.roomPrice + (rt.furniturePrice ?? 0)).toLocaleString()}/เดือน`,
  }));

  const onSubmit = async (data: EditRoomForm) => {
    try {
      await updateRoom(propertyId, room.id, {
        roomNumber: data.roomNumber,
        roomTypeId: data.roomTypeId,
        floor: data.floor ? Number(data.floor) : null,
        status: room.status !== "OCCUPIED" ? data.status : undefined,
      });
      onSuccess();
    } catch (err: any) {
      toast(err?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error");
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}
      title={`แก้ไขห้อง ${room.roomNumber}`} description="แก้ไขข้อมูลห้องพัก" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="เลขห้อง" placeholder="เช่น 101, A201"
          {...register("roomNumber", { required: "กรุณากรอกเลขห้อง" })} />
        <FormInput label="ชั้น" type="number" {...register("floor")} />
        <Controller name="roomTypeId" control={control}
          render={({ field }) => (
            <SelectInput label="ประเภทห้อง"
              value={field.value ?? ""} onValueChange={field.onChange} options={roomTypeOptions} />
          )} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะห้อง</label>
          {room.status === "OCCUPIED" ? (
            <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-400">
              {room.contractStatus === "MOVE_OUT_NOTICE"
                ? "ผู้เช่าแจ้งย้ายออกแล้ว — ไม่สามารถแก้ไขสถานะได้"
                : "ห้องมีผู้เช่าอยู่ — ไม่สามารถแก้ไขสถานะได้"}
            </div>
          ) : (
            <Controller name="status" control={control}
              render={({ field }) => (
                <SelectInput value={field.value ?? ""} onValueChange={field.onChange} options={STATUS_EDIT_OPTIONS} />
              )} />
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
