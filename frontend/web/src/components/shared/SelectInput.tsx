import * as Select from "@radix-ui/react-select";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function SelectInput({ label, placeholder = "เลือก...", options, value, onValueChange, error, disabled }: SelectInputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <Select.Trigger className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white
          ${error ? "border-red-300" : "border-gray-200 focus:border-purple-400"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
          <Select.Value placeholder={<span className="text-gray-400">{placeholder}</span>} />
          <Select.Icon><RiArrowDownSLine className="text-gray-400" /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
            <Select.Viewport className="p-1">
              {options.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 cursor-pointer rounded-lg outline-none data-[highlighted]:bg-purple-50 data-[highlighted]:text-purple-700">
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator><RiCheckLine className="text-purple-600" /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
