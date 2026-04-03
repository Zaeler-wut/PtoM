type Status =
  | "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"
  | "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
  | "AVAILABLE" | "RESERVED" | "OCCUPIED" | "PREPARING" | "MAINTENANCE"
  | "DRAFT" | "READY" | "VERIFYING" | "PAID" | "REJECTED"
  | "COMPLETED" | "ONLINE" | "OFFLINE";

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  PENDING:          { label: "รอดำเนินการ",    className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED:        { label: "ยืนยันแล้ว",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  CHECKED_IN:       { label: "เข้าอยู่แล้ว",    className: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED:        { label: "ยกเลิก",          className: "bg-red-50 text-red-700 border-red-200" },
  ACTIVE:           { label: "ใช้งาน",          className: "bg-green-50 text-green-700 border-green-200" },
  MOVE_OUT_NOTICE:  { label: "แจ้งย้ายออก",     className: "bg-orange-50 text-orange-700 border-orange-200" },
  ENDED:            { label: "สิ้นสุด",          className: "bg-gray-50 text-gray-600 border-gray-200" },
  AVAILABLE:        { label: "ว่าง",            className: "bg-green-50 text-green-700 border-green-200" },
  RESERVED:         { label: "จอง",             className: "bg-blue-50 text-blue-700 border-blue-200" },
  OCCUPIED:         { label: "มีผู้เช่า",        className: "bg-purple-50 text-purple-700 border-purple-200" },
  PREPARING:        { label: "เตรียมว่าง",       className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  MAINTENANCE:      { label: "ปรับปรุง",         className: "bg-red-50 text-red-700 border-red-200" },
  DRAFT:            { label: "ร่าง",            className: "bg-gray-50 text-gray-600 border-gray-200" },
  READY:            { label: "พร้อม",           className: "bg-blue-50 text-blue-700 border-blue-200" },
  VERIFYING:        { label: "กำลังตรวจสอบ",    className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PAID:             { label: "ชำระแล้ว",        className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED:         { label: "ปฏิเสธ",          className: "bg-red-50 text-red-700 border-red-200" },
  COMPLETED:        { label: "เสร็จสิ้น",        className: "bg-green-50 text-green-700 border-green-200" },
  ONLINE:           { label: "ออนไลน์",         className: "bg-blue-50 text-blue-700 border-blue-200" },
  OFFLINE:          { label: "ออฟไลน์",         className: "bg-gray-50 text-gray-600 border-gray-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status as Status] ?? { label: status, className: "bg-gray-50 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}