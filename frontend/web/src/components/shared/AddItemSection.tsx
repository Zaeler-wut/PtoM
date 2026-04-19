import { RiAddLine, RiDeleteBinLine } from "react-icons/ri";

interface Item { title: string; amount: number; }

interface AddItemSectionProps {
  title: string;
  items: Item[];
  onAdd: () => void;
  onUpdate: (index: number, field: "title" | "amount", value: string) => void;
  onRemove: (index: number) => void;
  emptyText: string;
}

export function AddItemSection({ title, items, onAdd, onUpdate, onRemove, emptyText }: AddItemSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <RiAddLine size={13} /> เพิ่มรายการ
        </button>
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg px-4 py-4 text-center">
          <p className="text-xs text-gray-400">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.title}
                onChange={(e) => onUpdate(i, "title", e.target.value)}
                placeholder="รายการ..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white"
              />
              <input
                type="number"
                value={item.amount || ""}
                onChange={(e) => onUpdate(i, "amount", e.target.value)}
                placeholder="0"
                className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white"
              />
              <button type="button" onClick={() => onRemove(i)}
                className="text-red-400 hover:text-red-600 px-1 transition-colors">
                <RiDeleteBinLine size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
