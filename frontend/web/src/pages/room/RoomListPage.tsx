import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/shared/Modal";
import { FormInput } from "../../components/shared/FormInput";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiArrowDownSLine } from "react-icons/ri";

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "OCCUPIED", label: "มีผู้เช่า" },
  { value: "RESERVED", label: "จอง" },
  { value: "MAINTENANCE", label: "ปรับปรุง" },
];

const mockRooms = [
  { id: "1", roomNumber: "101", floor: 1, roomType: { name: "Standard" }, status: "OCCUPIED", price: "฿3,000" },
  { id: "2", roomNumber: "102", floor: 1, roomType: { name: "Standard" }, status: "AVAILABLE", price: "฿3,000" },
  { id: "3", roomNumber: "103", floor: 1, roomType: { name: "Deluxe" }, status: "OCCUPIED", price: "฿4,500" },
  { id: "4", roomNumber: "104", floor: 1, roomType: { name: "Deluxe" }, status: "AVAILABLE", price: "฿4,500" },
  { id: "5", roomNumber: "201", floor: 2, roomType: { name: "Suite" }, status: "OCCUPIED", price: "฿6,000" },
  { id: "6", roomNumber: "202", floor: 2, roomType: { name: "Suite" }, status: "AVAILABLE", price: "฿6,000" },
  { id: "7", roomNumber: "301", floor: 3, roomType: { name: "Standard" }, status: "RESERVED", price: "฿3,000" },
  { id: "8", roomNumber: "302", floor: 3, roomType: { name: "Deluxe" }, status: "MAINTENANCE", price: "฿4,500" },
];

interface AddRoomForm { roomNumber: string; floor: string; roomType: string; }
interface EditRoomForm { roomNumber: string; floor: string; roomType: string; status: string; }

export default function RoomListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addModal, setAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<typeof mockRooms[0] | null>(null);

  const filtered = mockRooms.filter((r) => {
    const matchSearch = r.roomNumber.includes(search);
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลห้องพักและสถานะ</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขห้อง..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-purple-400 bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 min-w-[180px]">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-center text-sm text-gray-700 outline-none bg-transparent appearance-none cursor-pointer">
              {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <RiArrowDownSLine className="text-gray-400 flex-shrink-0" size={16} />
          </div>

          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
            <RiAddLine size={16} /> เพิ่มห้อง
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <p className="text-base font-semibold text-gray-700">รายการห้องทั้งหมด ({filtered.length})</p>
          </div>
          <div className="overflow-x-auto mx-7 mb-4 rounded-xl border border-gray-300 mt-3">
            <table className="w-full">
              <thead className="border-b border-gray-300">
                <tr>
                  {["เลขห้อง", "ชั้น", "ประเภทห้อง", "ราคา/เดือน", "สถานะ", "ชื่อ", "จัดการ"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filtered.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-600">{room.roomNumber}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{room.floor}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{room.roomType.name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{room.price}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={room.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">-</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setEditRoom(room)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                        <RiEditLine size={13} /> แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        <AddRoomModal open={addModal} onClose={() => setAddModal(false)} />

        {/* Edit Modal */}
        {editRoom && (
          <EditRoomModal
            open={!!editRoom}
            room={editRoom}
            onClose={() => setEditRoom(null)}
          />
        )}
      </div>
    </div>
  );
}

function AddRoomModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddRoomForm>();
  const onSubmit = (data: AddRoomForm) => { console.log(data); reset(); onClose(); };
  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}
      title="เพิ่มห้อง" description="เพิ่มข้อมูลห้องพักใหม่" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="เลขห้อง" error={errors.roomNumber?.message}
          {...register("roomNumber", { required: "กรุณากรอกเลขห้อง" })} />
        <FormInput label="ชั้น" type="number" {...register("floor")} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทห้อง</label>
          <select {...register("roomType")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white cursor-pointer">
            <option value="">เลือกประเภทห้อง...</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit"
            className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors">
            บันทึก
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditRoomModal({ open, room, onClose }: {
  open: boolean;
  room: typeof mockRooms[0];
  onClose: () => void;
}) {
  const { register, handleSubmit } = useForm<EditRoomForm>({
    defaultValues: {
      roomNumber: room.roomNumber,
      floor: String(room.floor),
      roomType: room.roomType.name,
      status: room.status,
    },
  });

  const onSubmit = (data: EditRoomForm) => {
    console.log("แก้ไขห้อง:", data);
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}
      title="แก้ไขห้อง" description="แก้ไขข้อมูลห้องพัก" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="เลขห้อง" {...register("roomNumber")} />
        <FormInput label="ชั้น" type="number" {...register("floor")} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทห้อง</label>
          <select {...register("roomType")}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white cursor-pointer">
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะห้อง</label>
          {room.status === "OCCUPIED" ? (
            <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
              ห้องมีผู้เช่าอยู่ - ไม่สามารถแก้ไขสถานะได้
            </div>
          ) : (
            <select {...register("status")}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white cursor-pointer">
              <option value="AVAILABLE">ว่าง</option>
              <option value="RESERVED">จอง</option>
              <option value="PREPARING">เตรียมห้อง</option>
              <option value="MAINTENANCE">ปรับปรุง</option>
            </select>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit"
            className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors">
            บันทึก
          </button>
        </div>
      </form>
    </Modal>
  );
}