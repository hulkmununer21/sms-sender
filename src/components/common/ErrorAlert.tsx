import React from "react";
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from "lucide-react";

type AlertType = "error" | "success" | "info" | "warning";

interface ErrorAlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const typeStyles: Record<AlertType, { bg: string; border: string; icon: React.FC<any> }> = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: InfoIcon,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: AlertTriangle,
  },
};

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  type = "error",
  title,
  message,
  onClose,
  dismissible = true,
}) => {
  const style = typeStyles[type];
  const Icon = style.icon;

  const textColors: Record<AlertType, string> = {
    error: "text-red-800",
    success: "text-green-800",
    info: "text-blue-800",
    warning: "text-yellow-800",
  };

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-start gap-3 ${textColors[type]}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-50 hover:opacity-100 transition flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
