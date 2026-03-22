// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { fetchRooms, createRoom } from "../../store/slices/roomSlice";
// import { fetchPropertyDetail } from "../../store/slices/propertySlice";
// import type { Room, CreateRoomPayload, RoomStatus } from "../../types/room.types";
// import { Modal } from "../../components/shared/Modal";
// import { FormInput } from "../../components/shared/FormInput";
// import { SelectInput } from "../../components/shared/SelectInput";
// import { StatusBadge } from "../../components/shared/StatusBadge";
// import { RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiArrowDownSLine } from "react-icons/ri";
// import { formatCurrency } from "../../utils/formatCurrency";
// import { ROOM_STATUS_OPTIONS } from "../../utils/constants";

// const STATUS_FILTER_OPTIONS = [
//   { value: "ALL", label: "ทุกสถานะ" },
//   ...ROOM_STATUS_OPTIONS,
// ];

// export default function RoomListPage() {
//   const { propertyId } = useParams<{ propertyId: string }>();
//   const dispatch = useAppDispatch();
//   const { list: rooms, isLoading } = useAppSelector((s) => s.room);
//   const { selected: property } = useAppSelector((s) => s.property);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [addModal, setAddModal] = useState(false);
//   const [editRoom, setEditRoom] = useState<Room | null>(null);

//   useEffect(() => {
//     if (!propertyId) return;
//     Promise.all([
//       dispatch(fetchRooms(propertyId)),
//       dispatch(fetchPropertyDetail(propertyId)),
//     ]);
//   }, [propertyId, dispatch]);

//   const filtered = rooms.filter((r) => {
//     const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
//     return matchSearch && matchStatus;
//   });

//   const roomTypeOptions = (property?.roomTypes ?? []).map((rt) => ({
//     value: rt.id,
//     label: rt.name,
//   }));

//   const getRoomPrice = (room: Room) => {
//     const rt = property?.roomTypes?.find((t) => t.id === room.roomTypeId);
//     return rt ? formatCurrency(rt.roomPrice) : "—";
//   };

//   return (
//     <div className="p-8 bg-purple-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
//         <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลห้องพักและสถานะ</p>
//       </div>

//       {/* Toolbar */}
//       <div className="flex items-center gap-3 mb-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
//         {/* Search */}
//         <div className="relative flex-1 max-w-9xl">
//           <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="ค้นหาเลขห้อง..."
//             className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 bg-white transition-colors"
//           />
//         </div>

//         {/* Status Filter */}
//         <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 min-w-[180px]">
//           <RiFilterLine className="text-gray-400 flex-shrink-0" size={16} />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="flex-1 text-center text-sm text-gray-700 outline-none bg-transparent appearance-none cursor-pointer"
//           >
//             {STATUS_FILTER_OPTIONS.map((o) => (
//               <option key={o.value} value={o.value}>{o.label}</option>
//             ))}
//           </select>
//           <RiArrowDownSLine className="text-gray-400 flex-shrink-0" size={16} />
//         </div>

//         {/* Add Button */}
//         <button
//           onClick={() => setAddModal(true)}
//           className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
//         >
//           <RiAddLine size={16} /> เพิ่มห้อง
//         </button>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//         <div className="px-5 py-4 border-gray-100">
//           <p className="text-sm font-semibold text-gray-700">
//             รายการห้องทั้งหมด ({filtered.length})
//           </p>
//         </div>

//         <div className="overflow-x-auto mx-4 mb-4 rounded-xl border border-gray-200 mt-3">
//           <table className="w-full">
//             <thead className="border-b border-gray-200">
//               <tr>
//                 {["เลขห้อง", "ชั้น", "ประเภทห้อง", "ราคา/เดือน", "สถานะ", "ชื่อ", "จัดการ"].map((h) => (
//                   <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {isLoading ? (
//                 <tr>
//                   <td colSpan={7} className="px-5 py-12 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <span className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
//                       <span className="text-sm text-gray-400">กำลังโหลด...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
//                     ไม่พบห้อง
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((room) => (
//                   <tr key={room.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{room.roomNumber}</td>
//                     <td className="px-5 py-3.5 text-sm text-gray-600">{room.floor ?? "—"}</td>
//                     <td className="px-5 py-3.5 text-sm text-gray-600">{room.roomType?.name ?? "—"}</td>
//                     <td className="px-5 py-3.5 text-sm text-gray-600">{getRoomPrice(room)}</td>
//                     <td className="px-5 py-3.5"><StatusBadge status={room.status} /></td>
//                     <td className="px-5 py-3.5 text-sm text-gray-600">—</td>
//                     <td className="px-5 py-3.5">
//                       <button
//                         onClick={() => setEditRoom(room)}
//                         className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//                       >
//                         <RiEditLine size={13} /> แก้ไข
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Modal */}
//       <RoomModal
//         open={addModal}
//         onClose={() => setAddModal(false)}
//         propertyId={propertyId ?? ""}
//         roomTypeOptions={roomTypeOptions}
//       />

//       {/* Edit Modal */}
//       {editRoom && (
//         <EditRoomModal
//           open={!!editRoom}
//           onClose={() => setEditRoom(null)}
//           room={editRoom}
//           roomTypeOptions={roomTypeOptions}
//         />
//       )}
//     </div>
//   );
// }

// function RoomModal({ open, onClose, propertyId, roomTypeOptions }: {
//   open: boolean; onClose: () => void;
//   propertyId: string; roomTypeOptions: { value: string; label: string }[];
// }) {
//   const dispatch = useAppDispatch();
//   const { isLoading } = useAppSelector((s) => s.room);
//   const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateRoomPayload>();

//   const onSubmit = async (data: CreateRoomPayload) => {
//     const result = await dispatch(createRoom({
//       propertyId,
//       payload: { ...data, floor: data.floor ? Number(data.floor) : undefined },
//     }));
//     if (createRoom.fulfilled.match(result)) { reset(); onClose(); }
//   };

//   return (
//     <Modal open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title="เพิ่มห้อง" description="เพิ่มข้อมูลห้องพักใหม่" size="sm">
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <FormInput label="เลขห้อง" error={errors.roomNumber?.message}
//           {...register("roomNumber", { required: "กรุณากรอกเลขห้อง" })} />
//         <FormInput label="ชั้น" type="number" {...register("floor")} />
//         <SelectInput label="ประเภทห้อง" options={roomTypeOptions}
//           placeholder="เลือกประเภทห้อง..." onValueChange={(v) => setValue("roomTypeId", v)} />
//         <div className="flex justify-end pt-2">
//           <button type="submit" disabled={isLoading}
//             className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors">
//             {isLoading ? "กำลังบันทึก..." : "บันทึก"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// }

// function EditRoomModal({ open, onClose, room, roomTypeOptions }: {
//   open: boolean; onClose: () => void;
//   room: Room; roomTypeOptions: { value: string; label: string }[];
// }) {
//   return (
//     <Modal open={open} onOpenChange={(o) => { if (!o) onClose(); }} title="แก้ไขห้อง" description="แก้ไขข้อมูลห้องพัก" size="sm">
//       <div className="space-y-4">
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">เลขห้อง</span>
//           <span className="text-sm font-semibold bg-purple-600 text-white px-3 py-1 rounded-lg">{room.roomNumber}</span>
//         </div>
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">ชั้น</span>
//           <span className="text-sm text-gray-700">{room.floor ?? "—"}</span>
//         </div>
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">ประเภทห้อง</span>
//           <span className="text-sm text-gray-700">{room.roomType?.name ?? "—"}</span>
//         </div>
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">สถานะห้อง</span>
//           <StatusBadge status={room.status} />
//         </div>
//         <div className="flex justify-end pt-2">
//           <button
//             className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors"
//             onClick={onClose}
//           >
//             บันทึก
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { fetchRooms, createRoom } from "../../store/slices/roomSlice";
// import { fetchPropertyDetail } from "../../store/slices/propertySlice";
// import type { Room, CreateRoomPayload, RoomStatus } from "../../types/room.types";
// import { Modal } from "../../components/shared/Modal";
// import { FormInput } from "../../components/shared/FormInput";
// import { SelectInput } from "../../components/shared/SelectInput";
// import { StatusBadge } from "../../components/shared/StatusBadge";
// import { RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiArrowDownSLine } from "react-icons/ri";
// import { formatCurrency } from "../../utils/formatCurrency";
// import { ROOM_STATUS_OPTIONS } from "../../utils/constants";

// const STATUS_FILTER_OPTIONS = [
//   { value: "ALL", label: "ทุกสถานะ" },
//   ...ROOM_STATUS_OPTIONS,
// ];

// export default function RoomListPage() {
//   const { propertyId } = useParams<{ propertyId: string }>();
//   const dispatch = useAppDispatch();
//   const { list: rooms, isLoading } = useAppSelector((s) => s.room);
//   const { selected: property } = useAppSelector((s) => s.property);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [addModal, setAddModal] = useState(false);
//   const [editRoom, setEditRoom] = useState<Room | null>(null);

//   useEffect(() => {
//     if (!propertyId) return;
//     Promise.all([
//       dispatch(fetchRooms(propertyId)),
//       dispatch(fetchPropertyDetail(propertyId)),
//     ]);
//   }, [propertyId, dispatch]);

//   const filtered = rooms.filter((r) => {
//     const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
//     return matchSearch && matchStatus;
//   });

//   const roomTypeOptions = (property?.roomTypes ?? []).map((rt) => ({
//     value: rt.id,
//     label: rt.name,
//   }));

//   const getRoomPrice = (room: Room) => {
//     const rt = property?.roomTypes?.find((t) => t.id === room.roomTypeId);
//     return rt ? formatCurrency(rt.roomPrice) : "—";
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <div className="p-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
//           <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลห้องพักและสถานะ</p>
//         </div>

//         {/* Toolbar */}
//         <div className="flex items-center gap-3 mb-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
//           <div className="relative flex-1 max-w-9xl">
//             <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="ค้นหาเลขห้อง..."
//               className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 bg-white transition-colors"
//             />
//           </div>

//           <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 min-w-[180px]">
//             <RiFilterLine className="text-gray-400 flex-shrink-0" size={16} />
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="flex-1 text-center text-sm text-gray-700 outline-none bg-transparent appearance-none cursor-pointer"
//             >
//               {STATUS_FILTER_OPTIONS.map((o) => (
//                 <option key={o.value} value={o.value}>{o.label}</option>
//               ))}
//             </select>
//             <RiArrowDownSLine className="text-gray-400 flex-shrink-0" size={16} />
//           </div>

//           <button
//             onClick={() => setAddModal(true)}
//             className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
//           >
//             <RiAddLine size={16} /> เพิ่มห้อง
//           </button>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//           <div className="px-5 py-4">
//             <p className="text-sm font-semibold text-gray-700">
//               รายการห้องทั้งหมด ({filtered.length})
//             </p>
//           </div>

//           <div className="overflow-x-auto mx-4 mb-4 rounded-xl border border-gray-200 mt-3">
//             <table className="w-full">
//               <thead className="border-b border-gray-200">
//                 <tr>
//                   {["เลขห้อง", "ชั้น", "ประเภทห้อง", "ราคา/เดือน", "สถานะ", "ชื่อ", "จัดการ"].map((h) => (
//                     <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {isLoading ? (
//                   <tr>
//                     <td colSpan={7} className="px-5 py-12 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         <span className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
//                         <span className="text-sm text-gray-400">กำลังโหลด...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
//                       ไม่พบห้อง
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((room) => (
//                     <tr key={room.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{room.roomNumber}</td>
//                       <td className="px-5 py-3.5 text-sm text-gray-600">{room.floor ?? "—"}</td>
//                       <td className="px-5 py-3.5 text-sm text-gray-600">{room.roomType?.name ?? "—"}</td>
//                       <td className="px-5 py-3.5 text-sm text-gray-600">{getRoomPrice(room)}</td>
//                       <td className="px-5 py-3.5"><StatusBadge status={room.status} /></td>
//                       <td className="px-5 py-3.5 text-sm text-gray-600">—</td>
//                       <td className="px-5 py-3.5">
//                         <button
//                           onClick={() => setEditRoom(room)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//                         >
//                           <RiEditLine size={13} /> แก้ไข
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Add Modal */}
//         <RoomModal
//           open={addModal}
//           onClose={() => setAddModal(false)}
//           propertyId={propertyId ?? ""}
//           roomTypeOptions={roomTypeOptions}
//         />

//         {/* Edit Modal */}
//         {editRoom && (
//           <EditRoomModal
//             open={!!editRoom}
//             onClose={() => setEditRoom(null)}
//             room={editRoom}
//             roomTypeOptions={roomTypeOptions}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// function RoomModal({ open, onClose, propertyId, roomTypeOptions }: {
//   open: boolean; onClose: () => void;
//   propertyId: string; roomTypeOptions: { value: string; label: string }[];
// }) {
//   const dispatch = useAppDispatch();
//   const { isLoading } = useAppSelector((s) => s.room);
//   const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateRoomPayload>();

//   const onSubmit = async (data: CreateRoomPayload) => {
//     const result = await dispatch(createRoom({
//       propertyId,
//       payload: { ...data, floor: data.floor ? Number(data.floor) : undefined },
//     }));
//     if (createRoom.fulfilled.match(result)) { reset(); onClose(); }
//   };

//   return (
//     <Modal open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title="เพิ่มห้อง" description="เพิ่มข้อมูลห้องพักใหม่" size="sm">
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <FormInput label="เลขห้อง" error={errors.roomNumber?.message}
//           {...register("roomNumber", { required: "กรุณากรอกเลขห้อง" })} />
//         <FormInput label="ชั้น" type="number" {...register("floor")} />
//         <SelectInput label="ประเภทห้อง" options={roomTypeOptions}
//           placeholder="เลือกประเภทห้อง..." onValueChange={(v) => setValue("roomTypeId", v)} />
//         <div className="flex justify-end pt-2">
//           <button type="submit" disabled={isLoading}
//             className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors">
//             {isLoading ? "กำลังบันทึก..." : "บันทึก"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// }

// function EditRoomModal({ open, onClose, room, roomTypeOptions }: {
//   open: boolean; onClose: () => void;
//   room: Room; roomTypeOptions: { value: string; label: string }[];
// }) {
//   return (
//     <Modal open={open} onOpenChange={(o) => { if (!o) onClose(); }} title="แก้ไขห้อง" description="แก้ไขข้อมูลห้องพัก" size="sm">
//       <div className="space-y-4">
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">เลขห้อง</span>
//           <span className="text-sm font-semibold bg-purple-600 text-white px-3 py-1 rounded-lg">{room.roomNumber}</span>
//         </div>
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">ชั้น</span>
//           <span className="text-sm text-gray-700">{room.floor ?? "—"}</span>
//         </div>
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">ประเภทห้อง</span>
//           <span className="text-sm text-gray-700">{room.roomType?.name ?? "—"}</span>
//         </div>
//         <div className="flex items-center justify-between py-2 border-b border-gray-100">
//           <span className="text-sm text-gray-500">สถานะห้อง</span>
//           <StatusBadge status={room.status} />
//         </div>
//         <div className="flex justify-end pt-2">
//           <button
//             className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors"
//             onClick={onClose}
//           >
//             บันทึก
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchRooms, createRoom } from "../../store/slices/roomSlice";
import { fetchPropertyDetail } from "../../store/slices/propertySlice";
import type { Room, CreateRoomPayload, RoomStatus } from "../../types/room.types";
import { Modal } from "../../components/shared/Modal";
import { FormInput } from "../../components/shared/FormInput";
import { SelectInput } from "../../components/shared/SelectInput";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiArrowDownSLine } from "react-icons/ri";
import { formatCurrency } from "../../utils/formatCurrency";
import { ROOM_STATUS_OPTIONS } from "../../utils/constants";

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "ทุกสถานะ" },
  ...ROOM_STATUS_OPTIONS,
];

export default function RoomListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const { list: rooms, isLoading } = useAppSelector((s) => s.room);
  const { selected: property } = useAppSelector((s) => s.property);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addModal, setAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    Promise.all([
      dispatch(fetchRooms(propertyId)),
      dispatch(fetchPropertyDetail(propertyId)),
    ]);
  }, [propertyId, dispatch]);

  const filtered = rooms.filter((r) => {
    const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const roomTypeOptions = (property?.roomTypes ?? []).map((rt) => ({
    value: rt.id,
    label: rt.name,
  }));

  const getRoomPrice = (room: Room) => {
    const rt = property?.roomTypes?.find((t) => t.id === room.roomTypeId);
    return rt ? formatCurrency(rt.roomPrice) : "—";
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลห้องพักและสถานะ</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
          <div className="relative flex-1 max-w-9xl">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขห้อง..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 min-w-[180px]">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-center text-sm text-gray-700 outline-none bg-transparent appearance-none cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <RiArrowDownSLine className="text-gray-400 flex-shrink-0" size={16} />
          </div>

          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
          >
            <RiAddLine size={16} /> เพิ่มห้อง
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-gray-700">
              รายการห้องทั้งหมด ({filtered.length})
            </p>
          </div>

          <div className="overflow-x-auto mx-4 mb-4 rounded-xl border border-gray-200 mt-3">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  {["เลขห้อง", "ชั้น", "ประเภทห้อง", "ราคา/เดือน", "สถานะ", "ชื่อ", "จัดการ"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                        <span className="text-sm text-gray-400">กำลังโหลด...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                      ไม่พบห้อง
                    </td>
                  </tr>
                ) : (
                  filtered.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{room.roomNumber}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{room.floor ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{room.roomType?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{getRoomPrice(room)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={room.status} /></td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">—</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setEditRoom(room)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <RiEditLine size={13} /> แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        <RoomModal
          open={addModal}
          onClose={() => setAddModal(false)}
          propertyId={propertyId ?? ""}
          roomTypeOptions={roomTypeOptions}
        />

        {/* Edit Modal */}
        {editRoom && (
          <EditRoomModal
            open={!!editRoom}
            onClose={() => setEditRoom(null)}
            room={editRoom}
            roomTypeOptions={roomTypeOptions}
          />
        )}
      </div>
    </div>
  );
}

function RoomModal({ open, onClose, propertyId, roomTypeOptions }: {
  open: boolean; onClose: () => void;
  propertyId: string; roomTypeOptions: { value: string; label: string }[];
}) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.room);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateRoomPayload>();

  const onSubmit = async (data: CreateRoomPayload) => {
    const result = await dispatch(createRoom({
      propertyId,
      payload: { ...data, floor: data.floor ? Number(data.floor) : undefined },
    }));
    if (createRoom.fulfilled.match(result)) { reset(); onClose(); }
  };

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title="เพิ่มห้อง" description="เพิ่มข้อมูลห้องพักใหม่" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="เลขห้อง" error={errors.roomNumber?.message}
          {...register("roomNumber", { required: "กรุณากรอกเลขห้อง" })} />
        <FormInput label="ชั้น" type="number" {...register("floor")} />
        <SelectInput label="ประเภทห้อง" options={roomTypeOptions}
          placeholder="เลือกประเภทห้อง..." onValueChange={(v) => setValue("roomTypeId", v)} />
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isLoading}
            className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors">
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditRoomModal({ open, onClose, room, roomTypeOptions }: {
  open: boolean; onClose: () => void;
  room: Room; roomTypeOptions: { value: string; label: string }[];
}) {
  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) onClose(); }} title="แก้ไขห้อง" description="แก้ไขข้อมูลห้องพัก" size="sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">เลขห้อง</span>
          <span className="text-sm font-semibold bg-purple-600 text-white px-3 py-1 rounded-lg">{room.roomNumber}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">ชั้น</span>
          <span className="text-sm text-gray-700">{room.floor ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">ประเภทห้อง</span>
          <span className="text-sm text-gray-700">{room.roomType?.name ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">สถานะห้อง</span>
          <StatusBadge status={room.status} />
        </div>
        <div className="flex justify-end pt-2">
          <button
            className="px-6 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors"
            onClick={onClose}
          >
            บันทึก
          </button>
        </div>
      </div>
    </Modal>
  );
}