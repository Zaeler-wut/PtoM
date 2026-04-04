import { RiEyeLine, RiCheckLine, RiCloseLine } from "react-icons/ri";

interface BookingActionButtonsProps {
  status: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDetail: () => void;
}

export function BookingActionButtons({ status, onConfirm, onCancel, onDetail }: BookingActionButtonsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {status === "รอการยืนยัน" && (
        <>
          <button onClick={onConfirm}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors">
            <RiCheckLine size={12} /> ยืนยัน
          </button>
          <button onClick={onCancel}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <RiCloseLine size={12} /> ยกเลิก
          </button>
        </>
      )}
      {(status === "จองสำเร็จ" || status === "เข้าอยู่แล้ว") && (
        <button onClick={onDetail}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <RiEyeLine size={12} /> ดูรายละเอียด
        </button>
      )}
    </div>
  );
}