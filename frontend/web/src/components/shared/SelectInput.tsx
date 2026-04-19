import * as Select from "@radix-ui/react-select";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
import { useState } from "react";

export interface SelectOption {
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
  className?: string;
}

export function SelectInput({
  label,
  placeholder = "เลือก...",
  options,
  value,
  onValueChange,
  error,
  disabled,
  className,
}: SelectInputProps) {
  const [touched, setTouched] = useState(false);
  const [hasSelected, setHasSelected] = useState(!!value);
  const selected = options.find((o) => o.value === value);

  const handleOpenChange = (open: boolean) => {
    if (!open) setTouched(true);
  };

  const handleValueChange = (v: string) => {
    setHasSelected(!!v);
    onValueChange(v);
  };

  const cleanLabel = label?.replace(/\s*\*+\s*$/, "").trim();
  const effectiveHasValue = !!value || hasSelected;
  const internalError =
    touched && !effectiveHasValue
      ? `กรุณาเลือก${cleanLabel ?? "ข้อมูล"}`
      : undefined;

  const displayError = error || internalError;

  return (
    <div className={`w-full ${className ?? ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <Select.Root
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        onOpenChange={handleOpenChange}
      >
        <Select.Trigger
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border rounded-xl outline-none bg-white transition-colors cursor-pointer
            ${
              displayError
                ? "border-red-400 bg-red-50/30"
                : "border-gray-200 hover:border-purple-400 focus:border-purple-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
            data-[placeholder]:text-gray-400`}
        >
          <Select.Value placeholder={placeholder}>
            {selected?.label}
          </Select.Value>
          <Select.Icon className="flex-shrink-0">
            <RiArrowDownSLine className="text-gray-400" size={16} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg animate-in fade-in-0 zoom-in-95"
          >
            <Select.Viewport className="p-1">
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg cursor-pointer outline-none select-none
                    hover:bg-purple-50 hover:text-purple-700
                    data-[highlighted]:bg-purple-50 data-[highlighted]:text-purple-700
                    data-[state=checked]:font-medium"
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <RiCheckLine size={14} className="text-purple-600" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {displayError && (
        <p className="mt-1 text-xs text-red-500">{displayError}</p>
      )}
    </div>
  );
}
