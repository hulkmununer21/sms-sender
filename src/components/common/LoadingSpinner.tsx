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
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeVariants[size]}`}
    ></div>
  );

  if (fullScreen) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {spinner}
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
