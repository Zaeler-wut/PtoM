import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, labelClassName, inputClassName, ...props }, ref) => {
    return (
      <div className={`w-full ${className ?? ""}`}>
        {label && (
          <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName ?? ""}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white
            ${error ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-purple-400"}
            ${inputClassName ?? ""}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";