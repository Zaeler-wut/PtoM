interface SummaryRowProps {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
  large?: boolean;
  borderTop?: boolean;
}

export function SummaryRow({ label, value, valueColor = "text-gray-900", bold, large, borderTop }: SummaryRowProps) {
  return (
    <div className={`flex items-center justify-between ${borderTop ? "border-t border-gray-200 pt-2 mt-1" : ""}`}>
      <span className={`${large ? "text-base font-bold text-gray-900" : "text-sm text-gray-600"}`}>{label}</span>
      <span className={`${large ? "text-xl font-bold" : bold ? "text-sm font-semibold" : "text-sm"} ${valueColor}`}>{value}</span>
    </div>
  );
}