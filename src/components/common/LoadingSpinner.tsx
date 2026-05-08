import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeVariants = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  fullScreen = false,
}) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-2 border-matrix-neon-green border-t-matrix-neon-cyan ${sizeVariants[size]}`}
      style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
    ></div>
  );

  if (fullScreen) {
    return (
      <div className="h-screen flex items-center justify-center bg-matrix-black">
        <div className="text-center">
          {spinner}
          <p className="text-matrix-neon-cyan mt-4 font-mono text-sm">&gt; LOADING NEURAL NETWORK...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
