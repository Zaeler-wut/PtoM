import { RiAddLine } from "react-icons/ri";

interface Item { name: string; amount: number; }

interface AddItemSectionProps {
  title: string;
  items: Item[];
  onAdd: () => void;
  emptyText: string;
}

export function AddItemSection({ title, items, onAdd, emptyText }: AddItemSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <RiAddLine size={13} /> เพิ่มรายการ
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">{emptyText}</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name}</span>
              <span className="text-gray-900">฿{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}