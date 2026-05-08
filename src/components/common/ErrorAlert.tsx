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

const typeStyles: Record<AlertType, { bg: string; border: string; icon: React.FC<any>; color: string; textColor: string }> = {
  error: {
    bg: "bg-matrix-dark",
    border: "border-matrix-neon-pink",
    icon: AlertCircle,
    color: "text-matrix-neon-pink",
    textColor: "text-matrix-neon-pink",
  },
  success: {
    bg: "bg-matrix-dark",
    border: "border-matrix-neon-green",
    icon: CheckCircle,
    color: "text-matrix-neon-green",
    textColor: "text-matrix-neon-green",
  },
  info: {
    bg: "bg-matrix-dark",
    border: "border-matrix-neon-cyan",
    icon: InfoIcon,
    color: "text-matrix-neon-cyan",
    textColor: "text-matrix-neon-cyan",
  },
  warning: {
    bg: "bg-matrix-dark",
    border: "border-matrix-neon-yellow",
    icon: AlertTriangle,
    color: "text-matrix-neon-yellow",
    textColor: "text-matrix-neon-yellow",
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

  return (
    <div
      className={`${style.bg} border-2 ${style.border} rounded-sm p-4 flex items-start gap-3 ${style.textColor}`}
      style={{ boxShadow: `inset 0 0 10px ${type === 'error' ? 'rgba(255, 0, 110, 0.2)' : type === 'success' ? 'rgba(0, 255, 65, 0.2)' : type === 'info' ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255, 190, 11, 0.2)'}` }}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold font-mono">&gt; {title}</p>
        {message && <p className="text-sm mt-1 opacity-90 font-mono">&gt; {message}</p>}
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`${style.color} opacity-50 hover:opacity-100 transition flex-shrink-0`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
