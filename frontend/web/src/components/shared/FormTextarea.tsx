import { forwardRef, useState } from "react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  labelClassName?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, className, labelClassName, onBlur, ...props }, ref) => {
    const [isEmpty, setIsEmpty] = useState(false);

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
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
        <textarea
          ref={ref}
          onBlur={handleBlur}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white resize-none
            ${
              displayError
                ? "border-red-400 focus:border-red-500 bg-red-50/30"
                : "border-gray-200 focus:border-purple-400"
            }`}
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

FormTextarea.displayName = "FormTextarea";
