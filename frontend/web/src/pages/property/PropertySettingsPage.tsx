// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { fetchPropertyDetail, updateProperty } from "../../store/slices/propertySlice";
// import { FormInput } from "../../components/shared/FormInput";
// import {
//   RiImageAddLine, RiQrCodeLine, RiMapPinLine, RiMoneyDollarCircleLine,
//   RiFileTextLine, RiAddLine, RiCloseLine, RiCheckLine, RiSaveLine,
// } from "react-icons/ri";

// interface SettingsForm {
//   priceMin: number;
//   priceMax: number;
//   contractTerm: string;
//   description: string;
//   address: string;
//   googleMap: string;
//   bankName: string;
//   bankAccount: string;
//   bankHolder: string;
// }

// export default function PropertySettingsPage() {
//   const { propertyId } = useParams<{ propertyId: string }>();
//   const dispatch = useAppDispatch();
//   const { selected: property, isLoading } = useAppSelector((s) => s.property);

//   const [amenities, setAmenities] = useState<string[]>([]);
//   const [amenityInput, setAmenityInput] = useState("");
//   const [mapLinked, setMapLinked] = useState(false);

//   const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SettingsForm>();

//   const googleMapValue = watch("googleMap");

//   useEffect(() => {
//     if (propertyId) dispatch(fetchPropertyDetail(propertyId));
//   }, [propertyId, dispatch]);

//   useEffect(() => {
//     if (!property) return;
//     reset({
//       priceMin: property.priceMin,
//       priceMax: property.priceMax,
//       contractTerm: property.contractTerm ?? "",
//       description: property.description ?? "",
//       address: property.address,
//       googleMap: property.googleMap ?? "",
//       bankName: property.bankName ?? "",
//       bankAccount: property.bankAccount ?? "",
//       bankHolder: property.bankHolder ?? "",
//     });
//     setAmenities(property.amenities ?? []);
//     setMapLinked(!!property.googleMap);
//   }, [property, reset]);

//   const onSubmit = async (data: SettingsForm) => {
//     if (!propertyId) return;
//     await dispatch(updateProperty({
//       propertyId,
//       payload: { ...data, amenities, priceMin: Number(data.priceMin), priceMax: Number(data.priceMax) },
//     }));
//   };

//   const addAmenity = () => {
//     const v = amenityInput.trim();
//     if (v && !amenities.includes(v)) {
//       setAmenities((prev) => [...prev, v]);
//       setAmenityInput("");
//     }
//   };

//   const removeAmenity = (a: string) => setAmenities((prev) => prev.filter((x) => x !== a));

//   const priceMin = watch("priceMin");
//   const priceMax = watch("priceMax");

//   return (
//     <div className="bg-purple-50 min-h-screen">
//       <div className="px-2 py-8 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">ตั้งค่ารายละเอียดสถานที่</h1>
//           <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลสถานที่และการตั้งค่าต่างๆ</p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

//           {/* ช่วงราคา + สิ่งอำนวยความสะดวก */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
//             {/* ช่วงราคา */}
//             <div className="bg-white rounded-2xl pt-5 pl-6 p-8 border border-gray-100 shadow-sm">
//               <div className="flex items-center gap-2 mb-4">
//                 <RiMoneyDollarCircleLine className="text-purple-500" size={18} />
//                 <h3 className="text-sm font-semibold text-gray-700">ช่วงราคา</h3>
//               </div>
//               <div className="grid grid-cols-2 gap-3 mb-3">
//                 <FormInput label="ราคาเริ่มต้น (บาท)" type="number"
//                   error={errors.priceMin?.message}
//                   {...register("priceMin", { required: "กรุณากรอกราคา" })} />
//                 <FormInput label="ราคาสูงสุด (บาท)" type="number"
//                   error={errors.priceMax?.message}
//                   {...register("priceMax", { required: "กรุณากรอกราคา" })} />
//               </div>
//               {priceMin && priceMax && (
//                 <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-900">
//                   แสดงในแอพ: ฿{Number(priceMin).toLocaleString()} - ฿{Number(priceMax).toLocaleString()}
//                 </div>
//               )}
//             </div>

//             {/* สิ่งอำนวยความสะดวก */}
//             <div className="bg-white rounded-2xl pt-5 pl-6 p-8 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">สิ่งอำนวยความสะดวก</h3>
//               <div className="flex gap-2 mb-3">
//                 <input
//                   type="text"
//                   value={amenityInput}
//                   onChange={(e) => setAmenityInput(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
//                   placeholder="เพิ่มสิ่งอำนวยความสะดวก เช่น Wi-Fi, ที่จอดรถ"
//                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
//                 />
//                 <button type="button" onClick={addAmenity}
//                   className="w-9 h-9 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0">
//                   <RiAddLine size={16} />
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {amenities.map((a) => (
//                   <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
//                     {a}
//                     <button type="button" onClick={() => removeAmenity(a)} className="text-gray-400 hover:text-gray-600">
//                       <RiCloseLine size={13} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* ระยะเวลาสัญญาเช่า */}
//           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-4xl">
//             <div className="flex items-center gap-2 mb-4">
//               <RiFileTextLine className="text-purple-500" size={18} />
//               <h3 className="text-sm font-semibold text-gray-700">ระยะเวลาสัญญาเช่า</h3>
//             </div>
//             <FormInput
//               label="ระยะเวลาสัญญาเช่า"
//               placeholder='6 เดือน - 1 ปี'
//               hint='ระบุระยะเวลาสัญญาเช่า เช่น "6 เดือน - 1 ปี" หรือ "1 ปี" (สามารถแก้ไขได้ตามต้องการ)'
//               {...register("contractTerm")}
//             />
//           </div>

//           {/* รายละเอียดหอพัก */}
//           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-4xl">
//             <h3 className="text-sm font-semibold text-gray-700 mb-4">รายละเอียดหอพัก</h3>
//             <div>
//               <textarea
//                 rows={5}
//                 placeholder="อธิบายรายละเอียดของหอพัก เช่น ทำเลที่ตั้ง สิ่งดึงดูดสายตา ข้อดีของหอพัก..."
//                 {...register("description")}
//                 className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none"
//               />
//               <p className="text-xs text-gray-400 mt-1">{watch("description")?.length ?? 0} ตัวอักษร</p>
//             </div>
//           </div>

//           {/* ที่อยู่และแผนที่ */}
//           <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm max-w-4xl">
//             <div className="flex items-center gap-2 mb-4">
//               <RiMapPinLine className="text-purple-500" size={18} />
//               <h3 className="text-sm font-semibold text-gray-700">ที่อยู่และแผนที่</h3>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">ที่อยู่เต็ม</label>
//                 <textarea rows={2} {...register("address")}
//                   className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none" />
//               </div>
//               <div>
//                 <FormInput
//                   label="Google Maps URL"
//                   placeholder="https://maps.google.com/?q=13.7248936,100.5357075"
//                   hint="วิธีหา: เปิด Google Maps → คลิกขวาที่แผนที่ → คัดลอก URL หรือใส่ Latitude, Longitude"
//                   {...register("googleMap")}
//                 />
//                 {googleMapValue && (
//                   <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
//                     <RiCheckLine className="text-green-600" size={16} />
//                     <span className="text-sm text-green-700">สังเกตแผนที่ถูกตั้งไว้แล้ว - ผู้ใช้สามารถกดเพื่อนำทางได้</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* รูปภาพโปรโมท */}
//           <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm max-w-4xl">
//             <div className="flex items-center gap-2 mb-4">
//               <RiImageAddLine className="text-purple-500" size={18} />
//               <h3 className="text-sm font-semibold text-gray-700">รูปภาพโปรโมท</h3>
//             </div>
//             <ImageUploadZone label="รูปภาพหอพัก" multiple />
//           </div>

//           {/* โลโก้หอพัก + QR Code */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
//             <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
//               <div className="flex items-center gap-2 mb-4">
//                 <RiImageAddLine className="text-purple-500" size={18} />
//                 <h3 className="text-sm font-semibold text-gray-700">โลโก้หอพัก</h3>
//               </div>
//               <ImageUploadZone label="โลโก้" />
//             </div>
//             <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
//               <div className="flex items-center gap-2 mb-4">
//                 <RiQrCodeLine className="text-purple-500" size={18} />
//                 <h3 className="text-sm font-semibold text-gray-700">QR Code ชำระเงิน</h3>
//               </div>
//               <ImageUploadZone label="QR Code" />
//             </div>
//           </div>

//           {/* ข้อมูลธนาคาร */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
//             <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อผู้จัดการ</h3>
//               <FormInput {...register("bankHolder")} />
//             </div>
//             <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อธนาคาร</h3>
//               <FormInput {...register("bankName")} />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
//             <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">เลขที่บัญชี</h3>
//               <FormInput {...register("bankAccount")} />
//             </div>
//             <div className="bg-white rounded-2xl pt-5 p-6 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อบัญชี</h3>
//               <FormInput {...register("bankHolder")} />
//             </div>
//           </div>

//           {/* Save Button */}
//           <div className="flex justify-end pb-8 max-w-4xl">
//             <button type="submit" disabled={isLoading}
//               className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-900 disabled:opacity-60 transition-colors">
//               <RiSaveLine size={16} />
//               {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// }

// // ── Image Upload Zone ───────────────────────────────────────────────────────
// function ImageUploadZone({ label, multiple = false }: { label: string; multiple?: boolean }) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [previews, setPreviews] = useState<string[]>([]);

//   const handleFiles = (files: FileList | null) => {
//     if (!files) return;
//     const urls = Array.from(files).map((f) => URL.createObjectURL(f));
//     setPreviews((prev) => multiple ? [...prev, ...urls] : urls);
//   };

//   return (
//     <div>
//       <div
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
//         className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors"
//       >
//         <RiImageAddLine className="text-gray-300 mb-2" size={32} />
//         <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดหรือลากไฟล์มาวาง</p>
//         <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB, แนะนำ 1200×800px)</p>
//       </div>
//       <input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         multiple={multiple}
//         className="hidden"
//         onChange={(e) => handleFiles(e.target.files)}
//       />
//       {previews.length > 0 && (
//         <div className="flex gap-2 mt-3 flex-wrap">
//           {previews.map((src, i) => (
//             <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200">
//               <img src={src} className="w-full h-full object-cover" />
//               <button
//                 type="button"
//                 onClick={() => setPreviews((prev) => prev.filter((_, j) => j !== i))}
//                 className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
//               >
//                 <RiCloseLine size={12} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { FormInput } from "../../components/shared/FormInput";
import {
  RiImageAddLine, RiQrCodeLine, RiMapPinLine, RiMoneyDollarCircleLine,
  RiFileTextLine, RiAddLine, RiCloseLine, RiCheckLine, RiSaveLine,
} from "react-icons/ri";

interface SettingsForm {
  priceMin: number;
  priceMax: number;
  contractTerm: string;
  description: string;
  address: string;
  googleMap: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  bankAccountNumber: string;
}

export default function PropertySettingsPage() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.property);

  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SettingsForm>();

  const googleMapValue = watch("googleMap");
  const priceMin = watch("priceMin");
  const priceMax = watch("priceMax");

  const onSubmit = (data: SettingsForm) => {
    console.log({ ...data, amenities });
  };

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (v && !amenities.includes(v)) {
      setAmenities((prev) => [...prev, v]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (a: string) => setAmenities((prev) => prev.filter((x) => x !== a));

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่ารายละเอียดสถานที่</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลสถานที่และการตั้งค่าต่างๆ</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ช่วงราคา + สิ่งอำนวยความสะดวก */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RiMoneyDollarCircleLine className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">ช่วงราคา</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormInput label="ราคาเริ่มต้น (บาท)" type="number"
                  error={errors.priceMin?.message}
                  {...register("priceMin", { required: "กรุณากรอกราคา" })} />
                <FormInput label="ราคาสูงสุด (บาท)" type="number"
                  error={errors.priceMax?.message}
                  {...register("priceMax", { required: "กรุณากรอกราคา" })} />
              </div>
              {priceMin && priceMax && (
                <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-900">
                  แสดงในแอพ: ฿{Number(priceMin).toLocaleString()} - ฿{Number(priceMax).toLocaleString()}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
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
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <RiFileTextLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">ระยะเวลาสัญญาเช่า</h3>
            </div>
            <FormInput
              label="ระยะเวลาสัญญาเช่า"
              placeholder="6 เดือน - 1 ปี"
              hint='ระบุระยะเวลาสัญญาเช่า เช่น "6 เดือน - 1 ปี" หรือ "1 ปี"'
              {...register("contractTerm")}
            />
          </div>

          {/* รายละเอียดหอพัก */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-4xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">รายละเอียดหอพัก</h3>
            <textarea
              rows={5}
              placeholder="อธิบายรายละเอียดของหอพัก เช่น ทำเลที่ตั้ง สิ่งดึงดูดสายตา ข้อดีของหอพัก..."
              {...register("description")}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{watch("description")?.length ?? 0} ตัวอักษร</p>
          </div>

          {/* ที่อยู่และแผนที่ */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <RiMapPinLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">ที่อยู่และแผนที่</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ที่อยู่เต็ม</label>
                <textarea rows={2} {...register("address")}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none" />
              </div>
              <FormInput
                label="Google Maps URL"
                placeholder="https://maps.google.com/?q=13.7248936,100.5357075"
                hint="วิธีหา: เปิด Google Maps → คลิกขวาที่แผนที่ → คัดลอก URL หรือใส่ Latitude, Longitude"
                {...register("googleMap")}
              />
              {googleMapValue && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                  <RiCheckLine className="text-green-600" size={16} />
                  <span className="text-sm text-green-700">สังเกตแผนที่ถูกตั้งไว้แล้ว - ผู้ใช้สามารถกดเพื่อนำทางได้</span>
                </div>
              )}
            </div>
          </div>

          {/* รูปภาพโปรโมท */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <RiImageAddLine className="text-purple-500" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">รูปภาพโปรโมท</h3>
            </div>
            <ImageUploadZone multiple />
          </div>

          {/* โลโก้หอพัก + QR Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RiImageAddLine className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">โลโก้หอพัก</h3>
              </div>
              <ImageUploadZone />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <RiQrCodeLine className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">QR Code ชำระเงิน</h3>
              </div>
              <ImageUploadZone />
            </div>
          </div>

          {/* ข้อมูลธนาคาร */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อผู้จัดการ</h3>
              <FormInput label="ชื่อผู้จัดการ" {...register("bankHolder")} />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อธนาคาร</h3>
              <FormInput label="ชื่อธนาคาร" {...register("bankName")} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">เลขที่บัญชี</h3>
              <FormInput label="เลขที่บัญชี" {...register("bankAccountNumber")} />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">ชื่อบัญชี</h3>
              <FormInput label="ชื่อบัญชี" {...register("bankAccount")} />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pb-8 max-w-4xl">
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

function ImageUploadZone({ multiple = false }: { multiple?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews((prev) => multiple ? [...prev, ...urls] : urls);
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
        <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดหรือลากไฟล์มาวาง</p>
        <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB, แนะนำ 1200×800px)</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple}
        className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      {previews.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={src} className="w-full h-full object-cover" />
              <button type="button"
                onClick={() => setPreviews((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white">
                <RiCloseLine size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}