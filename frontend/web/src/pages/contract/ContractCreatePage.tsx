import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RiArrowLeftLine, RiCalendarLine } from "react-icons/ri"
import { getBookings, getContractPrefill } from "../../api/booking/bookingApi"
import { createOfflineContract } from "../../api/contract/contractApi"
import { getRooms, type Room } from "../../api/room/roomApi"
import type { BookingListItem } from "../../types/booking.types"
import { createContractSchema, type CreateContractFormData } from "../../schemas/contractSchema"
import { FormInput } from "../../components/shared/FormInput"
import { SelectInput } from "../../components/shared/SelectInput"

export default function ContractCreatePage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()

  const [source, setSource] = useState<"manual" | "booking">("manual")
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingPrefill, setLoadingPrefill] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [prefillInfo, setPrefillInfo] = useState<{
    firstName: string; lastName: string; email: string
    roomNumber: string; roomType: string
  } | null>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<CreateContractFormData>({ resolver: zodResolver(createContractSchema) as any })

  useEffect(() => {
    if (!propertyId) return
    getRooms(propertyId).then(setRooms).catch(console.error)
  }, [propertyId])

  useEffect(() => {
    if (source !== "booking" || !propertyId) return
    setLoadingBookings(true)
    getBookings(propertyId)
      .then((data) => setBookings(data.filter((b) => b.status === "CONFIRMED")))
      .catch(console.error)
      .finally(() => setLoadingBookings(false))
  }, [source, propertyId])

  const handleBookingSelect = async (bookingId: string) => {
    if (!bookingId || !propertyId) return
    setLoadingPrefill(true)
    setPrefillInfo(null)
    try {
      const data = await getContractPrefill(propertyId, bookingId)
      setValue("bookingId", data.bookingId)
      setValue("firstName", data.firstName ?? "")
      setValue("lastName", data.lastName ?? "")
      setValue("email", data.email ?? "")
      setValue("phone", data.phone ?? "")
      setValue("lineId", data.lineId ?? "")
      if (data.roomId) setValue("roomId", data.roomId)
      if (data.moveInDate) {
        const d = new Date(data.moveInDate)
        setValue("startDate", d.toISOString().split("T")[0])
      }
      if (data.securityDeposit) setValue("securityDeposit", data.securityDeposit)
      setPrefillInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roomNumber: data.roomNumber,
        roomType: data.roomType,
      })
    } catch (e: any) {
      alert(e.response?.data?.error ?? "ไม่สามารถดึงข้อมูลการจองได้")
    } finally {
      setLoadingPrefill(false)
    }
  }

  const onSubmit = async (data: CreateContractFormData) => {
    if (!propertyId) return
    setSubmitting(true)
    setSubmitError("")
    try {
      const result = await createOfflineContract(propertyId, {
        ...data,
        securityDeposit: Number(data.securityDeposit),
      })
      navigate(`/properties/${propertyId}/contracts/${result.id}`)
    } catch (e: any) {
      setSubmitError(e.response?.data?.error ?? "เกิดข้อผิดพลาด")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSourceChange = (s: "manual" | "booking") => {
    setSource(s)
    setPrefillInfo(null)
    reset()
  }

  const roomOptions = rooms
    .filter((r) => r.status === "AVAILABLE" || r.status === "RESERVED" || r.status === "PREPARING")
    .map((r) => ({ value: r.id, label: `ห้อง ${r.roomNumber}` }))

  const bookingOptions = bookings.map((b) => ({
    value: b.bookingId,
    label: `${b.firstName} ${b.lastName} — ห้อง ${b.roomNumber} (${b.roomType})`,
  }))

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => navigate(`/properties/${propertyId}/contracts`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors">
        <RiArrowLeftLine /> กลับ
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">สร้างสัญญาเช่า</h1>

      <form onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">

        {/* source selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">ประเภทการสร้างสัญญา</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => handleSourceChange("manual")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                source === "manual"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              สร้างเอง
            </button>
            <button type="button" onClick={() => handleSourceChange("booking")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                source === "booking"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              <RiCalendarLine size={15} />
              จากการจอง
            </button>
          </div>
        </div>

        {/* booking selector */}
        {source === "booking" && (
          <div className="space-y-3">
            {loadingBookings ? (
              <p className="text-sm text-gray-400">กำลังโหลดรายการจอง...</p>
            ) : bookingOptions.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
                ไม่มีการจองที่ยืนยันแล้วรอสร้างสัญญา
              </p>
            ) : (
              <SelectInput
                label="เลือกการจอง"
                options={bookingOptions}
                placeholder="เลือกการจอง..."
                onValueChange={handleBookingSelect}
              />
            )}
            {loadingPrefill && <p className="text-sm text-gray-400">กำลังดึงข้อมูล...</p>}
            {prefillInfo && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-violet-700 mb-2">ข้อมูลที่ดึงมาจากการจอง</p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400 mr-1">ผู้เช่า:</span>
                  {prefillInfo.firstName} {prefillInfo.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400 mr-1">อีเมล:</span>{prefillInfo.email}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-400 mr-1">ห้อง:</span>
                  {prefillInfo.roomNumber} ({prefillInfo.roomType})
                </p>
              </div>
            )}
          </div>
        )}

        <hr className="border-gray-100" />

        {/* ข้อมูลผู้เช่า */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลผู้เช่า</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="ชื่อ" error={errors.firstName?.message}
                {...register("firstName", { required: "กรุณากรอกชื่อ" })} />
              <FormInput label="นามสกุล" error={errors.lastName?.message}
                {...register("lastName", { required: "กรุณากรอกนามสกุล" })} />
            </div>
            <FormInput label="อีเมล" type="email" error={errors.email?.message}
              {...register("email", { required: "กรุณากรอกอีเมล" })} />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="เบอร์โทร" {...register("phone")} />
              <FormInput label="Line ID" {...register("lineId")} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ข้อมูลห้องและสัญญา */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลห้องและสัญญา</p>
          <div className="space-y-3">
            <SelectInput
              label="ห้อง"
              options={roomOptions}
              placeholder="เลือกห้อง..."
              onValueChange={(v) => setValue("roomId", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="วันเริ่มสัญญา" type="date" error={errors.startDate?.message}
                {...register("startDate", { required: "กรุณาเลือกวันเริ่ม" })} />
              <FormInput label="วันสิ้นสุดสัญญา" type="date" error={errors.endDate?.message}
                {...register("endDate", { required: "กรุณาเลือกวันสิ้นสุด" })} />
            </div>
            <FormInput label="เงินประกัน (บาท)" type="number" error={errors.securityDeposit?.message}
              {...register("securityDeposit", { required: "กรุณากรอกเงินประกัน" })} />
          </div>
        </div>

        {submitError && <p className="text-sm text-red-500">{submitError}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/properties/${propertyId}/contracts`)}
            className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={submitting}
            className="px-5 py-2.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors">
            {submitting ? "กำลังบันทึก..." : "สร้างสัญญา"}
          </button>
        </div>
      </form>
    </div>
  )
}
