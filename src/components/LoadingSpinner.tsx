import React from "react";

const LoadingSpinner = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    aria-label="loading"
  >
    <div className="animate-spin ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12" />
  </div>
);

export default LoadingSpinner;
