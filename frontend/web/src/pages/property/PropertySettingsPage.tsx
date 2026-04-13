import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ENDPOINTS } from "../../api/endpoints";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPropertyDetail, updateProperty } from "../../store/slices/propertySlice";
import { useToast } from "../../components/shared/Toast";
import {
  RiImageAddLine, RiQrCodeLine, RiMapPinLine, RiMoneyDollarCircleLine,
  RiFileTextLine, RiAddLine, RiCloseLine, RiCheckLine, RiSaveLine, RiStickyNoteLine,
  RiTimeLine,
} from "react-icons/ri";

function parseLatLngFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  // @lat,lng,zoom  →  google.com/maps/@13.72,100.53,15z
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
  // ?q=lat,lng  →  maps.google.com/?q=13.72,100.53
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }
  // !3dlat!4dlng  →  embedded share URL
  const embedMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (embedMatch) return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) }
  return null
}

interface SettingsForm {
  name: string;
  priceMin: number;
  priceMax: number;
  preparingDays: number;
  contractTerm: string;
  description: string;
  address: string;
  googleMap: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  billNote: string;
  lat: string;
  lng: string;
}

export default function PropertySettingsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const { selected: property, isLoading } = useAppSelector((s) => s.property);

  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const { toast } = useToast();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SettingsForm>();
  const googleMapValue = watch("googleMap");

  // ── ดึง lat/lng จาก Google Maps URL อัตโนมัติ ──
  useEffect(() => {
    if (!googleMapValue) return;
    const run = async () => {
      let urlToParse = googleMapValue;
      if (/goo\.gl|maps\.app/i.test(googleMapValue)) {
        try {
          const res = await import("../../api/axiosInstance").then(m =>
            m.default.get<{ resolvedUrl: string }>(ENDPOINTS.resolveMapUrl(googleMapValue))
          );
          urlToParse = res.data.resolvedUrl;
        } catch { return; }
      }
      const coords = parseLatLngFromGoogleMapsUrl(urlToParse);
      if (coords) {
        setValue("lat", String(coords.lat));
        setValue("lng", String(coords.lng));
      }
    };
    run();
  }, [googleMapValue]);

  // ── ดึงข้อมูลตอนเปิดหน้า (ถ้า MainLayout ยังไม่ได้โหลดหรือเป็น property อื่น) ──
  useEffect(() => {
    if (propertyId && property?.id !== propertyId) {
      dispatch(fetchPropertyDetail(propertyId))
    }
  }, [propertyId, dispatch]);

  // ── ใส่ข้อมูลลงฟอร์มเมื่อได้ข้อมูลมา ──
  useEffect(() => {
    if (!property || !property.id) return;
    reset({
      name: property.name,
      priceMin: property.priceMin,
      priceMax: property.priceMax,
      contractTerm: property.contractTerm ?? "",
      description: property.description ?? "",
      address: property.address,
      googleMap: property.googleMap ?? "",
      bankName: property.bankName ?? "",
      bankAccount: property.bankAccount ?? "",
      bankHolder: property.bankHolder ?? "",
      billNote: property.billNote ?? "",
      preparingDays: property.preparingDays ?? 3,
      lat: property.lat != null ? String(property.lat) : "",
      lng: property.lng != null ? String(property.lng) : "",
    });
    setAmenities(property.facilities ?? property.amenities ?? []);
  }, [property?.id]);

  // ── บันทึก ──
  const onSubmit = async (data: SettingsForm) => {
    if (!propertyId) return;
    const result = await dispatch(updateProperty({
      propertyId,
      payload: {
        ...data,
        facilities: amenities,
        priceMin: Number(data.priceMin),
        priceMax: Number(data.priceMax),
        preparingDays: Number(data.preparingDays) || 1,
        lat: data.lat !== "" ? Number(data.lat) : null,
        lng: data.lng !== "" ? Number(data.lng) : null,
        billNote: data.billNote?.trim() || null,
      },
    }));
    if (updateProperty.fulfilled.match(result)) {
      toast("บันทึกการตั้งค่าสำเร็จ");
    } else {
      toast("เกิดข้อผิดพลาด ไม่สามารถบันทึกได้", "error");
    }
  };

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (v && !amenities.includes(v)) {
      setAmenities((prev) => [...prev, v]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (a: string) => setAmenities((prev) => prev.filter((x) => x !== a));
  const priceMin = watch("priceMin");
  const priceMax = watch("priceMax");

  if (isLoading && !property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="px-2 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่ารายละเอียดสถานที่</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลสถานที่และการตั้งค่าต่างๆ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ชื่อสถานที่ */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อสถานที่</label>
            <input
              type="text"
              {...register("name", { required: "กรุณากรอกชื่อสถานที่" })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* ช่วงราคา + สิ่งอำนวยความสะดวก */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            {/* ช่วงราคา */}
            <div className="bg-white rounded-2xl pt-5 pl-6 p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RiMoneyDollarCircleLine className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">ช่วงราคา</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาเริ่มต้น (บาท)</label>
                  <input type="number" {...register("priceMin", { required: "กรุณากรอกราคา" })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                  {errors.priceMin && <p className="text-red-400 text-xs mt-1">{errors.priceMin.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาสูงสุด (บาท)</label>
                  <input type="number" {...register("priceMax", { required: "กรุณากรอกราคา" })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                  {errors.priceMax && <p className="text-red-400 text-xs mt-1">{errors.priceMax.message}</p>}
                </div>
              </div>
              {priceMin && priceMax && (
                <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-900">
                  แสดงในแอพ: ฿{Number(priceMin).toLocaleString()} - ฿{Number(priceMax).toLocaleString()}
                </div>
              )}
            </div>

            {/* สิ่งอำนวยความสะดวก */}
            <div className="bg-white rounded-2xl pt-5 pl-6 p-8 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">สิ่งอำนวยความสะดวก</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                  placeholder="เพิ่มสิ่งอำนวยความสะดวก เช่น Wi-Fi, ที่จอดรถ"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                />
                <button type="button" onClick={addAmenity}
                  className="w-9 h-9 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0">
                  <RiAddLine size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {a}
                    <button type="button" onClick={() => removeAmenity(a)} className="text-gray-400 hover:text-gray-600">
                      <RiCloseLine size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ระยะเวลาสัญญาเช่า */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ">
            <div className="flex items-center gap-2 mb-4">
              <RiFileTextLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">ระยะเวลาสัญญาเช่า</h3>
            </div>
            <input type="text" placeholder='6 เดือน - 1 ปี' {...register("contractTerm")}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
            <p className="text-xs text-gray-400 mt-1">ระบุระยะเวลาสัญญาเช่า เช่น "6 เดือน - 1 ปี" หรือ "1 ปี"</p>
          </div>

          {/* จำนวนวันเตรียมห้องหลังผู้เช่าออก */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <RiTimeLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">จำนวนวันเตรียมห้องหลังผู้เช่าออก</h3>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={30}
                {...register("preparingDays", { min: 0, max: 30 })}
                className="w-28 px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 text-center"
              />
              <span className="text-sm text-gray-500">วัน</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ระบบจะเปิดให้จองห้องนี้ได้ หลังจากผู้เช่าเก่าออกไปแล้ว <strong>{watch("preparingDays") ?? 3} วัน</strong> เช่น ออกวันที่ 25 จะเปิดจองวันที่ {25 + (Number(watch("preparingDays")) || 3)} เป็นต้นไป
            </p>
          </div>

          {/* รายละเอียดหอพัก */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">รายละเอียดหอพัก</h3>
            <textarea rows={5} placeholder="อธิบายรายละเอียดของหอพัก..." {...register("description")}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none" />
            <p className="text-xs text-gray-400 mt-1">{watch("description")?.length ?? 0} ตัวอักษร</p>
          </div>

          {/* ที่อยู่และแผนที่ */}
          <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm ">
            <div className="flex items-center gap-2 mb-4">
              <RiMapPinLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">ที่อยู่และแผนที่</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ที่อยู่เต็ม</label>
                <textarea rows={2} {...register("address")}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps URL</label>
                <input type="text" placeholder="https://maps.google.com/?q=13.7248936,100.5357075"
                  {...register("googleMap")}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                <p className="text-xs text-gray-400 mt-1">วิธีหา: เปิด Google Maps → คลิกขวาที่แผนที่ → คัดลอก URL</p>
                {googleMapValue && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                    <RiCheckLine className="text-green-600" size={16} />
                    <span className="text-sm text-green-700">ตั้งแผนที่ไว้แล้ว - ผู้ใช้สามารถกดเพื่อนำทางได้</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ละติจูด (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="13.7563"
                    {...register("lat")}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ลองจิจูด (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="100.5018"
                    {...register("lng")}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">วาง Google Maps URL ด้านบน ระบบจะดึงค่าให้อัตโนมัติ หรือกรอกเองก็ได้</p>
            </div>
          </div>

          {/* รูปภาพโปรโมท */}
          <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm ">
            <div className="flex items-center gap-2 mb-4">
              <RiImageAddLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">รูปภาพโปรโมท</h3>
            </div>
            {/* รูปที่บันทึกไว้แล้ว */}
            {property?.images && property.images.length > 0 && (
              <div className="flex gap-3 mb-4 flex-wrap">
                {property.images.map((img) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden border border-gray-200 w-32 h-24">
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                    {/* ปุ่มลบ */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!propertyId) return
                        const { propertyApi } = await import("../../api/property/propertyApi")
                        await propertyApi.deleteImage(propertyId, img.id)
                        dispatch(fetchPropertyDetail(propertyId))
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <RiCloseLine size={12} />
                    </button>
                    {/* badge cover */}
                    {img.isCover ? (
                      <div className="absolute bottom-0 left-0 right-0 bg-purple-600/80 text-white text-xs text-center py-0.5">
                        cover
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!propertyId) return
                          const { propertyApi } = await import("../../api/property/propertyApi")
                          await propertyApi.setCover(propertyId, img.id)
                          dispatch(fetchPropertyDetail(propertyId))
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-0.5 hover:bg-black/60"
                      >
                        set cover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <ImageUploadZone
              label="รูปภาพหอพัก"
              multiple
              folder="properties"
              onUploaded={async (urls) => {
                if (!propertyId) return
                const { propertyApi } = await import("../../api/property/propertyApi")
                await propertyApi.addImages(propertyId, urls)
                dispatch(fetchPropertyDetail(propertyId))
              }}
            />
          </div>

          {/* โลโก้หอพัก + QR Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RiImageAddLine className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">โลโก้หอพัก</h3>
              </div>
              {/* แสดงโลโก้ที่มีอยู่ */}
              {property?.logoUrl && (
                <div className="flex gap-3 mb-4 flex-wrap">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 w-32 h-24">
                    <img src={property.logoUrl} className="w-full h-full object-cover" alt="logo" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!propertyId) return
                        await dispatch(updateProperty({ propertyId, payload: { logoUrl: null } }))
                        dispatch(fetchPropertyDetail(propertyId))
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <RiCloseLine size={12} />
                    </button>
                  </div>
                </div>
              )}
              <ImageUploadZone
                label="โลโก้"
                folder="logos"
                onUploaded={async (urls) => {
                  if (!propertyId) return
                  await dispatch(updateProperty({ propertyId, payload: { logoUrl: urls[0] } }))
                  dispatch(fetchPropertyDetail(propertyId))
                }}
              />
            </div>
            <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RiQrCodeLine className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">QR Code ชำระเงิน</h3>
              </div>
              {/* แสดง QR Code ที่มีอยู่ */}
              {property?.paymentQrUrl && (
                <div className="flex gap-3 mb-4 flex-wrap">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 w-32 h-24">
                    <img src={property.paymentQrUrl} className="w-full h-full object-cover" alt="qr" />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!propertyId) return
                        await dispatch(updateProperty({ propertyId, payload: { paymentQrUrl: null } }))
                        dispatch(fetchPropertyDetail(propertyId))
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <RiCloseLine size={12} />
                    </button>
                  </div>
                </div>
              )}
              <ImageUploadZone
                label="QR Code"
                folder="qrcodes"
                onUploaded={async (urls) => {
                  if (!propertyId) return
                  await dispatch(updateProperty({ propertyId, payload: { paymentQrUrl: urls[0] } }))
                  dispatch(fetchPropertyDetail(propertyId))
                }}
              />
            </div>
          </div>

          {/* ข้อมูลธนาคาร */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อธนาคาร</h3>
              <input type="text" {...register("bankName")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
            </div>
            <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">เลขที่บัญชี</h3>
              <input type="text" {...register("bankAccount")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อบัญชี</h3>
              <input type="text" {...register("bankHolder")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
            </div>
          </div>

          {/* หมายเหตุในบิล */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <RiStickyNoteLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">หมายเหตุในบิล</h3>
            </div>
            {/* styled เหมือน section หมายเหตุในบิล */}
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-purple-600 mb-3">● หมายเหตุ</p>
              <textarea
                rows={6}
                {...register("billNote")}
                placeholder={"1. กรุณาชำระภายในวันที่ 5 ของทุกเดือน พร้อมส่งสลิปการโอน\n2. หากเลยกำหนดชำระ ปรับวันละ 50 บาท\n3. โอนเข้าบัญชี ธนาคาร เลขที่ 000-0-00000-0 ชื่อบัญชี ชื่อ นามสกุล"}
                className="w-full text-sm text-gray-700 leading-relaxed outline-none resize-none placeholder:text-gray-300"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">ข้อความด้านบนจะแสดงในบิลเป๊ะ แก้ไขได้ทุกบรรทัด</p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pb-8 ">
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors">
              <RiSaveLine size={16} />
              {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── Image Upload Zone ──────────────────────────────────────────────────────
function ImageUploadZone({
  label,
  multiple = false,
  folder = "general",
  onUploaded,
}: {
  label: string
  multiple?: boolean
  folder?: string
  onUploaded?: (urls: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const { uploadApi } = await import("../../api/upload/uploadApi");
      let uploadedUrls: string[];
      if (multiple) {
        uploadedUrls = await uploadApi.uploadImages(fileArray, folder);
      } else {
        const url = await uploadApi.uploadImage(fileArray[0], folder);
        uploadedUrls = [url];
      }
      onUploaded?.(uploadedUrls);
    } catch (err: any) {
      console.error("Upload failed:", err?.response?.data ?? err?.message ?? err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors"
      >
        <RiImageAddLine className="text-gray-300 mb-2" size={32} />
        {uploading ? (
          <p className="text-sm text-purple-500">กำลังอัปโหลด...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดหรือลากไฟล์มาวาง</p>
            <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB, แนะนำ 1200×800px)</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}