import { RiImageLine } from "react-icons/ri";

interface SlipViewerProps {
  label?: string;
  onClick?: () => void;
}

export function SlipViewer({ label = "ดูสลิป", onClick }: SlipViewerProps) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
      <RiImageLine size={12} /> {label}
    </button>
  );
}