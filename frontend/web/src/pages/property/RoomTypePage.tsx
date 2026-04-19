import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomTypeSchema } from "../../schemas/roomTypeSchema";
import { Modal } from "../../components/shared/Modal";
import { FormInput } from "../../components/shared/FormInput";
import {
  RiAddLine, RiEditLine, RiDeleteBinLine,
  RiFlashlightLine, RiWaterFlashLine,
  RiCheckboxCircleLine, RiStarLine, RiCalendarCheckLine, RiUserLine, RiHome2Line,
  RiImageLine, RiUploadCloud2Line, RiArrowLeftSLine, RiArrowRightSLine,
} from "react-icons/ri";
import {
  getRoomTypes, createRoomType, updateRoomType, deleteRoomType,
  addRoomTypeImages, deleteRoomTypeImage,
  type RoomType, type RoomTypePayload,
} from "../../api/room/roomTypeApi";
import { uploadApi } from "../../api/upload/uploadApi";
import { useToast } from "../../components/shared/Toast";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

// ── Types ──────────────────────────────────────────────────────────────────
interface Fee { name: string; price: number }
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
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RoomTypePage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState<RoomType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<RoomType | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(target.id);
    try {
      await deleteRoomType(propertyId!, target.id);
      await fetchRoomTypes();
      toast(`ลบประเภทห้อง "${target.name}" สำเร็จ`);
    } catch (err: any) {
      toast(err?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const fetchRoomTypes = async () => {
    if (!propertyId) return;
    setIsLoading(true);
    try {
      setRoomTypes(await getRoomTypes(propertyId));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoomTypes(); }, [propertyId]);

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าประเภทห้องและราคา</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการประเภทห้องพักและกำหนดอัตราค่าบริการต่างๆ</p>
        </div>

        <button onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors mb-6">
          <RiAddLine size={16} /> เพิ่มประเภทห้อง
        </button>

        {isLoading ? (
          <p className="text-sm text-gray-400">กำลังโหลด...</p>
        ) : roomTypes.length === 0 ? (
          <p className="text-sm text-gray-400">ยังไม่มีประเภทห้อง</p>
        ) : (
          <div className="space-y-6">
            {roomTypes.map((rt) => (
              <RoomTypeCard key={rt.id} roomType={rt}
                onEdit={() => setEditItem(rt)}
                onDelete={() => setConfirmTarget(rt)}
                isDeleting={deletingId === rt.id}
              />
            ))}
          </div>
        )}
      </div>

      <RoomTypeModal
        open={addModal}
        onClose={() => setAddModal(false)}
        mode="add"
        propertyId={propertyId!}
        onSuccess={() => { setAddModal(false); fetchRoomTypes(); toast("เพิ่มประเภทห้องสำเร็จ"); }}
      />
      {editItem && (
        <RoomTypeModal
          open
          onClose={() => setEditItem(null)}
          mode="edit"
          propertyId={propertyId!}
          roomTypeId={editItem.id}
          defaultValues={editItem}
          onSuccess={() => { setEditItem(null); fetchRoomTypes(); toast("แก้ไขประเภทห้องสำเร็จ"); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
        title={`ลบประเภทห้อง "${confirmTarget?.name}"`}
        description="การลบจะไม่สามารถกู้คืนได้ และจะลบรูปภาพ ค่าบริการ และสิ่งอำนวยความสะดวกที่เกี่ยวข้องทั้งหมด"
        confirmLabel="ลบ"
        variant="danger"
        isLoading={!!deletingId}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ── Room Type Card ─────────────────────────────────────────────────────────
function RoomTypeCard({ roomType: rt, onEdit, onDelete, isDeleting }: {
  roomType: RoomType; onEdit: () => void; onDelete: () => void; isDeleting: boolean;
}) {
  const fixedTotal = rt.roomPrice + (rt.furniturePrice ?? 0) + rt.fees.reduce((s, f) => s + f.price, 0);
  const total = rt.images.length;
  const stripRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Image strip with arrow navigation */}
      {total > 0 && (
        <div className="relative group px-4 pt-4">
          <div
            ref={stripRef}
            className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {rt.images.map((img) => (
              <img key={img.id} src={img.url} alt={rt.name}
                className="w-64 h-44 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
            ))}
          </div>
          {total > 1 && (
            <>
              <button
                onClick={() => stripRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <RiArrowLeftSLine size={20} />
              </button>
              <button
                onClick={() => stripRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <RiArrowRightSLine size={20} />
              </button>
            </>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">{rt.name}</h2>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
              rt.allowOnlineBooking ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              <RiCheckboxCircleLine size={12} />
              {rt.allowOnlineBooking ? "เปิดให้จอง" : "ปิดให้จอง"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <RiEditLine size={13} /> แก้ไข
            </button>
            <button onClick={onDelete} disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
              <RiDeleteBinLine size={13} /> {isDeleting ? "กำลังลบ..." : "ลบ"}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-5">{rt.description}</p>

        {/* Pricing grid */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-1.5 mb-3">
              <RiCalendarCheckLine className="text-green-600" size={20} />
              <span className="text-base font-semibold text-green-900">คิดในบิลทุกเดือน</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-green-900">ค่าเช่า:</span>
                <span className="font-medium text-green-900">฿{rt.roomPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-900">ค่าเฟอร์นิเจอร์:</span>
                <span className="font-medium text-green-900">฿{(rt.furniturePrice ?? 0).toLocaleString()}</span>
              </div>
              {rt.fees.map((f, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-green-900">{f.name}:</span>
                  <span className="font-medium text-green-900">฿{f.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between border-t-2 border-green-300 pt-1.5 mt-1.5">
                <span className="font-semibold text-green-900">รวม/เดือน:</span>
                <span className="text-lg font-bold text-green-900">฿{fixedTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-1.5 mb-3">
              <RiWaterFlashLine className="text-blue-500" size={18} />
              <RiFlashlightLine className="text-yellow-500" size={18} />
              <p className="text-base font-semibold text-blue-900">สาธารณูปโภค</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiWaterFlashLine className="text-blue-400" size={15} />
                  <span className="text-blue-800">ค่าน้ำ:</span>
                </div>
                <span className="font-medium text-blue-900">฿{rt.waterRate}/หน่วย</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiFlashlightLine className="text-yellow-500" size={15} />
                  <span className="text-blue-800">ค่าไฟ:</span>
                </div>
                <span className="font-medium text-blue-900">฿{rt.electricRate}/หน่วย</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-1.5 mb-3">
              <RiCalendarCheckLine className="text-amber-500" size={18} />
              <p className="text-base font-semibold text-amber-900">ค่าใช้จ่ายการจอง</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-800">เงินมัดจำ:</span>
                <span className="font-medium text-amber-900">฿{rt.bookingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">ค่าเช่าล่วงหน้า:</span>
                <span className="font-medium text-amber-900">฿{rt.advanceRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">ประกันความเสียหาย:</span>
                <span className="font-medium text-amber-900">฿{rt.securityDeposit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-4 text-sm text-gray-800">
            {rt.size != null && (
              <span className="flex items-center gap-1.5"><RiHome2Line size={14} />{rt.size} ตร.ม.</span>
            )}
            {rt.maxOccupants != null && (
              <span className="flex items-center gap-1.5"><RiUserLine size={14} />สูงสุด {rt.maxOccupants} คน</span>
            )}
            <span className="text-gray-500">จำนวนห้อง: {rt.roomCount} ห้อง</span>
          </div>
          {rt.facilities.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-gray-800">
                <RiStarLine size={14} className="flex-shrink-0" />
                <span>สิ่งอำนวยความสะดวก:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rt.facilities.map((f) => (
                  <span key={f} className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 text-xs rounded-full">{f}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Room Type Modal ────────────────────────────────────────────────────────
function RoomTypeModal({ open, onClose, mode, propertyId, roomTypeId, defaultValues, onSuccess }: {
  open: boolean; onClose: () => void;
  mode: "add" | "edit";
  propertyId: string;
  roomTypeId?: string;
  defaultValues?: RoomType;
  onSuccess: () => void;
}) {
  // ── Image state ──
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>(
    defaultValues?.images ?? []
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + filePreviews.length;
  const canAddMore = totalImages < 5;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview)); };
  }, []);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const available = 5 - totalImages;
    if (available <= 0) return;
    const files = Array.from(fileList).slice(0, available);
    setFilePreviews((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExisting = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedIds((prev) => [...prev, id]);
  };

  const removeNew = (index: number) => {
    setFilePreviews((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Form state ──
  const [facilityInput, setFacilityInput] = useState("");
  const [facilities, setFacilities] = useState<string[]>(defaultValues?.facilities ?? []);
  const [allowOnlineBooking, setAllowOnlineBooking] = useState(defaultValues?.allowOnlineBooking ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<RoomTypeForm>({ resolver: zodResolver(roomTypeSchema) as any,
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
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fees" });
  const roomPrice = watch("roomPrice") || 0;
  const furniturePrice = watch("furniturePrice") || 0;
  const fees = watch("fees") || [];
  const totalFixed = Number(roomPrice) + Number(furniturePrice) + fees.reduce((s, f) => s + Number(f.price || 0), 0);

  const addFacility = () => {
    const items = facilityInput
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v && !facilities.includes(v));
    if (items.length > 0) { setFacilities((p) => [...p, ...items]); setFacilityInput(""); }
  };

  const onSubmit = async (data: RoomTypeForm) => {
    setIsSubmitting(true);
    try {
      const payload: RoomTypePayload = {
        name: data.name,
        description: data.description,
        size: Number(data.size),
        maxOccupants: Number(data.maxOccupants),
        roomPrice: Number(data.roomPrice),
        furniturePrice: Number(data.furniturePrice),
        waterRate: Number(data.waterRate),
        electricRate: Number(data.electricRate),
        bookingFee: Number(data.bookingFee),
        advanceRent: Number(data.advanceRent),
        securityDeposit: Number(data.securityDeposit),
        fees: data.fees.map((f) => ({ name: f.name, price: Number(f.price) })),
        facilities,
        allowOnlineBooking,
      };

      if (mode === "add") {
        let imageUrls: string[] = [];
        if (filePreviews.length > 0) {
          imageUrls = await uploadApi.uploadImages(filePreviews.map((fp) => fp.file), "roomtype");
        }
        await createRoomType(propertyId, { ...payload, images: imageUrls });
      } else {
        await updateRoomType(propertyId, roomTypeId!, payload);
        for (const id of deletedIds) {
          await deleteRoomTypeImage(propertyId, roomTypeId!, id);
        }
        if (filePreviews.length > 0) {
          const newUrls = await uploadApi.uploadImages(filePreviews.map((fp) => fp.file), "roomtype");
          if (newUrls.length > 0) await addRoomTypeImages(propertyId, roomTypeId!, newUrls);
        }
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}
      title={mode === "add" ? "เพิ่มประเภทห้องใหม่" : "แก้ไขประเภทห้อง"}
      description="กรอกข้อมูลประเภทห้องพักและอัตราค่าบริการต่างๆ"
      size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">

        {/* รูปภาพ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RiImageLine size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-800">รูปภาพห้องพัก</span>
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">แนะนำ</span>
          </div>

          {/* Thumbnails */}
          {(existingImages.length > 0 || filePreviews.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-20 h-20">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => removeExisting(img.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <RiDeleteBinLine size={10} />
                  </button>
                </div>
              ))}
              {filePreviews.map((fp, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={fp.preview} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <RiDeleteBinLine size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone */}
          {canAddMore ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFilesSelected(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-gray-50"}`}>
              <RiUploadCloud2Line size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่</p>
              <p className="text-xs text-gray-400 mb-3">รองรับไฟล์ JPG, PNG, GIF (สูงสุด 5 รูป)</p>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors">
                <RiImageLine size={14} /> เลือกไฟล์
                <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/gif"
                  className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
              </label>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">ครบ 5 รูปแล้ว</p>
          )}

          {totalImages > 0 && (
            <p className="text-xs text-gray-400 mt-1.5 text-right">{totalImages}/5 รูป</p>
          )}
        </div>

        {/* ข้อมูลพื้นฐาน */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 pb-3 border-b border-gray-200">ข้อมูลพื้นฐาน</h4>
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
                labelClassName="text-sm font-semibold text-gray-800" {...register("size")} />
              <FormInput label="จำนวนผู้พักสูงสุด" type="number"
                labelClassName="text-sm font-semibold text-gray-800" {...register("maxOccupants")} />
            </div>
          </div>
        </div>

        {/* ค่าใช้จ่ายรายเดือน */}
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
                  <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2 text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-green-900">รวมค่าบริการคงที่:</span>
            <span className="text-sm font-bold text-green-700">฿{totalFixed.toLocaleString()}</span>
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
            <FormInput type="number" label="ค่าน้ำ (฿/หน่วย)"
              labelClassName="text-blue-900" inputClassName="border-blue-300 focus:border-blue-400"
              {...register("waterRate")} />
            <FormInput type="number" label="ค่าไฟ (฿/หน่วย)"
              labelClassName="text-blue-900" inputClassName="border-blue-300 focus:border-blue-400"
              {...register("electricRate")} />
          </div>
        </div>

        {/* ค่าใช้จ่ายก่อนเข้าอยู่ */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 pb-3 border-b border-gray-200">ค่าใช้จ่ายก่อนเข้าอยู่</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="เงินมัดจำการจอง (฿)" type="number"
                labelClassName="text-sm font-semibold text-gray-800" {...register("bookingFee")} />
              <FormInput label="ค่าเช่าล่วงหน้า (฿)" type="number"
                labelClassName="text-sm font-semibold text-gray-800" {...register("advanceRent")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="ประกันความเสียหาย (฿)" type="number"
                labelClassName="text-sm font-semibold text-gray-800" {...register("securityDeposit")} />
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
              placeholder="เช่น พัดลม, ห้องน้ำในตัว, เตียง (คั่นด้วย , เพื่อเพิ่มหลายรายการ)"
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
                  className="hover:text-orange-900 text-base leading-none">×</button>
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
          <button type="submit" disabled={isSubmitting}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSubmitting ? "กำลังบันทึก..." : mode === "add" ? "เพิ่มประเภทห้อง" : "บันทึกการแก้ไข"}
          </button>
        </div>

      </form>
    </Modal>
  );
}
