import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange";
}

const colorVariants = {
  blue: "bg-matrix-dark border-matrix-neon-purple text-matrix-neon-purple",
  green: "bg-matrix-dark border-matrix-neon-green text-matrix-neon-green",
  purple: "bg-matrix-dark border-matrix-neon-purple text-matrix-neon-purple",
  orange: "bg-matrix-dark border-matrix-neon-yellow text-matrix-neon-yellow",
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  return (
    <div className="card-matrix border-2 border-matrix-neon-cyan hover:border-matrix-neon-green hover:shadow-matrix transition p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-matrix-neon-cyan font-mono">&gt; {title}</p>
          <p className="text-3xl font-bold text-matrix-neon-green mt-2 matrix-text">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 font-bold font-mono ${
                trend.isPositive ? "text-matrix-neon-green" : "text-matrix-neon-pink"
              }`}
            >
              {trend.isPositive ? "▲" : "▼"} {Math.abs(trend.value)}% TREND
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-sm border-2 ${colorVariants[color]}`}
          style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
