// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { createProperty } from "../../store/slices/propertySlice";
// import type { CreatePropertyPayload } from "../../types/property.types";
// import { FormInput } from "../../components/shared/FormInput";
// import { RiArrowLeftLine } from "react-icons/ri";

// export default function PropertyCreatePage() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { isLoading, error } = useAppSelector((s) => s.property);

//   const { register, handleSubmit, formState: { errors } } = useForm<CreatePropertyPayload>();

//   const onSubmit = async (data: CreatePropertyPayload) => {
//     const result = await dispatch(createProperty({
//       ...data,
//       priceMin: Number(data.priceMin),
//       priceMax: Number(data.priceMax),
//       preparingDays: Number(data.preparingDays) || 3,
//     }));
//     if (createProperty.fulfilled.match(result)) {
//       navigate(`/properties/${result.payload.id}/dashboard`);
//     }
//   };

//   return (
//     <div className="p-8 max-w-2xl">
//       <button onClick={() => navigate("/properties")}
//         className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors">
//         <RiArrowLeftLine /> กลับ
//       </button>
//       <h1 className="text-2xl font-bold text-purple-900 mb-6">เพิ่มสถานที่ใหม่</h1>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Basic Info */}
//         <Section title="ข้อมูลทั่วไป">
//           <FormInput label="ชื่อสถานที่" error={errors.name?.message}
//             {...register("name", { required: "กรุณากรอกชื่อสถานที่" })} />
//           <FormInput label="ที่อยู่" error={errors.address?.message}
//             {...register("address", { required: "กรุณากรอกที่อยู่" })} />
//           <FormInput label="Google Maps URL" {...register("googleMap")} />
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">คำอธิบาย</label>
//             <textarea rows={3} {...register("description")}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none" />
//           </div>
//         </Section>

//         {/* Pricing */}
//         <Section title="ราคา">
//           <div className="grid grid-cols-2 gap-4">
//             <FormInput label="ราคาต่ำสุด (บาท)" type="number" error={errors.priceMin?.message}
//               {...register("priceMin", { required: "กรุณากรอกราคา" })} />
//             <FormInput label="ราคาสูงสุด (บาท)" type="number" error={errors.priceMax?.message}
//               {...register("priceMax", { required: "กรุณากรอกราคา" })} />
//           </div>
//           <FormInput label="เงื่อนไขสัญญา" placeholder="เช่น สัญญาขั้นต่ำ 1 ปี" {...register("contractTerm")} />
//           <FormInput label="จำนวนวันเตรียมห้อง" type="number" hint="จำนวนวันก่อนวันเข้าอยู่ที่ต้องเตรียมห้อง (default: 3)"
//             {...register("preparingDays")} />
//         </Section>

//         {/* Bank */}
//         <Section title="ข้อมูลการชำระเงิน">
//           <FormInput label="ชื่อธนาคาร" error={errors.bankName?.message}
//             {...register("bankName", { required: "กรุณากรอกชื่อธนาคาร" })} />
//           <div className="grid grid-cols-2 gap-4">
//             <FormInput label="เลขบัญชี" error={errors.bankAccount?.message}
//               {...register("bankAccount", { required: "กรุณากรอกเลขบัญชี" })} />
//             <FormInput label="ชื่อบัญชี" error={errors.bankHolder?.message}
//               {...register("bankHolder", { required: "กรุณากรอกชื่อบัญชี" })} />
//           </div>
//         </Section>

//         {error && <p className="text-sm text-red-500">{error}</p>}

//         <div className="flex gap-3">
//           <button type="button" onClick={() => navigate("/properties")}
//             className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
//             ยกเลิก
//           </button>
//           <button type="submit" disabled={isLoading}
//             className="px-5 py-2.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors">
//             {isLoading ? "กำลังบันทึก..." : "บันทึก"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
//       <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">{title}</h3>
//       {children}
//     </div>
//   );
// }