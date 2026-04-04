type BookingStatus = "รอการยืนยัน" | "จองสำเร็จ" | "เข้าอยู่แล้ว" | "ยกเลิก";

const statusConfig: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  "รอการยืนยัน": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  "จองสำเร็จ":   { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400" },
  "เข้าอยู่แล้ว": { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-400" },
  "ยกเลิก":      { bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as BookingStatus] ?? { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}