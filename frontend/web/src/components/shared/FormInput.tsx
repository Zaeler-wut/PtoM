import { forwardRef, useState } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      className,
      labelClassName,
      inputClassName,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isEmpty, setIsEmpty] = useState(false);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEmpty(!e.target.value.trim());
      onBlur?.(e);
    };

    const cleanLabel = label?.replace(/\s*\*+\s*$/, "").trim();
    const internalError = isEmpty ? `กรุณากรอก${cleanLabel ?? "ข้อมูล"}` : undefined;
    const displayError = error || internalError;

    return (
      <div className={`w-full ${className ?? ""}`}>
        {label && (
          <label
            className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName ?? ""}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          onBlur={handleBlur}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white
            ${
              displayError
                ? "border-red-400 focus:border-red-500 bg-red-50/30"
                : "border-gray-200 focus:border-purple-400"
            }
            ${inputClassName ?? ""}`}
          {...props}
        />
        {displayError && (
          <p className="mt-1 text-xs text-red-500">{displayError}</p>
        )}
        {hint && !displayError && (
          <p className="mt-1 text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
