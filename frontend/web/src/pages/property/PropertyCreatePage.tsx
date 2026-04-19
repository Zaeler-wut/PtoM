import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createProperty } from "../../store/slices/propertySlice";
import { RiArrowLeftLine } from "react-icons/ri";
import type { CreatePropertyPayload } from "../../types/property.types";

export default function PropertyCreatePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.property);
  const [form, setForm] = useState<CreatePropertyPayload>({
    name: "", address: "", googleMap: "", description: "",
    priceMin: 0, priceMax: 0, contractTerm: "", preparingDays: 3,
    bankName: "", bankAccount: "", bankHolder: "",
  });

  const set = (key: keyof CreatePropertyPayload, value: any) =>
    setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createProperty({
      ...form,
      priceMin: Number(form.priceMin),
      priceMax: Number(form.priceMax),
      preparingDays: Number(form.preparingDays) || 3,
    }));
    if (createProperty.fulfilled.match(result)) {
      navigate(`/properties/${result.payload.id}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/properties")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors">
          <RiArrowLeftLine /> กลับ
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">เพิ่มสถานที่ใหม่</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="ข้อมูลทั่วไป">
            <Field label="ชื่อสถานที่ *">
              <input className="input" value={form.name} required
                onChange={e => set("name", e.target.value)} placeholder="เช่น หอพักสุขสบาย" />
            </Field>
            <Field label="ที่อยู่ *">
              <textarea className="input resize-none" rows={2} value={form.address} required
                onChange={e => set("address", e.target.value)} placeholder="เลขที่ ถนน แขวง เขต จังหวัด" />
            </Field>
            <Field label="Google Maps URL">
              <input className="input" value={form.googleMap ?? ""} type="url"
                onChange={e => set("googleMap", e.target.value)} placeholder="https://maps.google.com/..." />
            </Field>
            <Field label="คำอธิบาย">
              <textarea className="input resize-none" rows={3} value={form.description ?? ""}
                onChange={e => set("description", e.target.value)} />
            </Field>
          </Section>

          <Section title="ราคา">
            <div className="grid grid-cols-2 gap-4">
              <Field label="ราคาต่ำสุด (บาท) *">
                <input className="input" type="number" min={0} value={form.priceMin} required
                  onChange={e => set("priceMin", e.target.value)} />
              </Field>
              <Field label="ราคาสูงสุด (บาท) *">
                <input className="input" type="number" min={0} value={form.priceMax} required
                  onChange={e => set("priceMax", e.target.value)} />
              </Field>
            </div>
            <Field label="เงื่อนไขสัญญา">
              <input className="input" value={form.contractTerm ?? ""} placeholder="เช่น สัญญาขั้นต่ำ 1 ปี"
                onChange={e => set("contractTerm", e.target.value)} />
            </Field>
            <Field label="จำนวนวันเตรียมห้อง">
              <input className="input" type="number" min={0} value={form.preparingDays ?? 3}
                onChange={e => set("preparingDays", e.target.value)} />
            </Field>
          </Section>

          <Section title="ข้อมูลรับชำระเงิน">
            <Field label="ธนาคาร *">
              <input className="input" value={form.bankName} required placeholder="เช่น กสิกรไทย"
                onChange={e => set("bankName", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="เลขบัญชี *">
                <input className="input" value={form.bankAccount} required placeholder="000-0-00000-0"
                  onChange={e => set("bankAccount", e.target.value)} />
              </Field>
              <Field label="ชื่อบัญชี *">
                <input className="input" value={form.bankHolder} required
                  onChange={e => set("bankHolder", e.target.value)} />
              </Field>
            </div>
          </Section>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate("/properties")}
              className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2.5 text-sm bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors">
              {isLoading ? "กำลังบันทึก..." : "บันทึกสถานที่"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
