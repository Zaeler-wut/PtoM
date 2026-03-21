import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createOfflineContract } from "../../store/slices/contractSlice";
import { fetchTenants } from "../../store/slices/tenantSlice";
import { fetchRooms } from "../../store/slices/roomSlice";
import type { CreateOfflineContractPayload } from "../../types/contract.types";
import { FormInput } from "../../components/shared/FormInput";
import { SelectInput } from "../../components/shared/SelectInput";
import { RiArrowLeftLine } from "react-icons/ri";

export default function ContractCreatePage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.contract);
  const { list: tenants } = useAppSelector((s) => s.tenant);
  const { list: rooms } = useAppSelector((s) => s.room);

  // Promise.all fetch tenants + rooms
  useEffect(() => {
    if (!propertyId) return;
    Promise.all([
      dispatch(fetchTenants(propertyId)),
      dispatch(fetchRooms(propertyId)),
    ]);
  }, [propertyId, dispatch]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateOfflineContractPayload>();

  const onSubmit = async (data: CreateOfflineContractPayload) => {
    const result = await dispatch(createOfflineContract({
      propertyId: propertyId!,
      payload: { ...data, securityDeposit: Number(data.securityDeposit) },
    }));
    if (createOfflineContract.fulfilled.match(result)) {
      navigate(`/properties/${propertyId}/contracts/${result.payload.id}`);
    }
  };

  const tenantOptions = tenants.map((t) => ({
    value: t.user.id,
    label: `${t.user.firstName} ${t.user.lastName}`,
  }));

  const roomOptions = rooms
    .filter((r) => r.status === "AVAILABLE" || r.status === "PREPARING")
    .map((r) => ({ value: r.id, label: `ห้อง ${r.roomNumber}` }));

  return (
    <div className="p-8 max-w-lg">
      <button onClick={() => navigate(`/properties/${propertyId}/contracts`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors">
        <RiArrowLeftLine /> กลับ
      </button>
      <h1 className="text-2xl font-bold text-purple-900 mb-6">สร้างสัญญา Offline</h1>

      <form onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <SelectInput
          label="ผู้เช่า"
          options={tenantOptions}
          placeholder="เลือกผู้เช่า..."
          onValueChange={(v) => setValue("userId", v)}
        />
        <SelectInput
          label="ห้อง"
          options={roomOptions}
          placeholder="เลือกห้อง..."
          onValueChange={(v) => setValue("roomId", v)}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="วันเริ่มสัญญา" type="date" error={errors.startDate?.message}
            {...register("startDate", { required: "กรุณาเลือกวันเริ่ม" })} />
          <FormInput label="วันสิ้นสุดสัญญา" type="date" error={errors.endDate?.message}
            {...register("endDate", { required: "กรุณาเลือกวันสิ้นสุด" })} />
        </div>
        <FormInput label="เงินประกัน (บาท)" type="number" error={errors.securityDeposit?.message}
          {...register("securityDeposit", { required: "กรุณากรอกเงินประกัน" })} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/properties/${propertyId}/contracts`)}
            className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={isLoading}
            className="px-5 py-2.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors">
            {isLoading ? "กำลังบันทึก..." : "สร้างสัญญา"}
          </button>
        </div>
      </form>
    </div>
  );
}