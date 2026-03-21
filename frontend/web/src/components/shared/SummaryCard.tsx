import type { IconType } from "react-icons";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

export function SummaryCard({ title, value, subtitle, icon: Icon, bgColor, iconColor, borderColor }: SummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-9 shadow-sm border-2 ${borderColor} hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="relative z-10">
        <p className={`text-sm font-medium mb-2 ${iconColor}`}>{title}</p>
        <p className={`text-3xl font-semibold mb-1 ${iconColor}`}>{value}</p>
        {subtitle && <p className={`text-xs ${iconColor} opacity-70`}>{subtitle}</p>}
      </div>
      <div className={`absolute -right-1 -bottom-1 ${iconColor} opacity-20`}>
        <Icon size={120} />
      </div>
    </div>
  );
}