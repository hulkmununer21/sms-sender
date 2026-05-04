import React, { useState, useCallback } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { validatePhoneNumber, formatToE164, formatToNational } from "../../utils/phoneUtils";

interface ValidatedPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean, formatted: string | null) => void;
  placeholder?: string;
  label?: string;
  defaultCountry?: string;
  showFormattedPreview?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const ValidatedPhoneInput: React.FC<ValidatedPhoneInputProps> = ({
  value,
  onChange,
  onValidChange,
  placeholder = "+1 (123) 456-7890",
  label = "Phone Number",
  defaultCountry = "US",
  showFormattedPreview = true,
  disabled = false,
  required = false,
}) => {
  const [isValid, setIsValid] = useState(false);
  const [formatted, setFormatted] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Validate in real-time
      const valid = validatePhoneNumber(newValue, defaultCountry);
      setIsValid(valid);

      if (valid) {
        const e164 = formatToE164(newValue, defaultCountry);
        const national = formatToNational(newValue, defaultCountry);
        setFormatted(national);
        
        if (onValidChange) {
          onValidChange(true, e164);
        }
      } else {
        setFormatted(null);
        if (onValidChange) {
          onValidChange(false, null);
        }
      }
    },
    [defaultCountry, onChange, onValidChange]
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 ${
            value === ""
              ? "border-gray-300 focus:ring-blue-500 focus:border-transparent"
              : isValid
                ? "border-green-300 focus:ring-green-500 focus:border-transparent"
                : "border-red-300 focus:ring-red-500 focus:border-transparent"
          } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}`}
        />

        {/* Validation Icons */}
        {value !== "" && (
          <div className="absolute right-3 top-2.5">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
        )}
      </div>

      {/* Formatted Preview */}
      {showFormattedPreview && isValid && formatted && (
        <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded px-3 py-2">
          <span className="text-gray-500">Formatted: </span>
          <span className="font-medium text-green-700">{formatted}</span>
        </div>
      )}

      {/* Error Message */}
      {value !== "" && !isValid && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Please enter a valid phone number</span>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-1">
        Format: {defaultCountry === "US" ? "+1 (area) 123-4567 or 1234567890" : "International format"}
      </p>
    </div>
  );
};

export default ValidatedPhoneInput;
