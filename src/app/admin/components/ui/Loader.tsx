"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  /** Screen par nahi dikhta, sirf screen readers ke liye hai */
  message?: string;
  className?: string;
}

const sizes = {
  sm: "h-7 w-7",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

function Spinner({ size, message }: { size: keyof typeof sizes; message: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <svg
        viewBox="0 0 50 50"
        className={`${sizes[size]} animate-spin`}
        aria-hidden="true"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#e0e7ff"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#4f46e5"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="60 200"
        />
      </svg>
      <span className="sr-only">{message}</span>
    </span>
  );
}

export default function Loader({
  size = "md",
  fullScreen = false,
  message = "Loading",
  className = "",
}: LoaderProps) {
  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/90 ${className}`}
      >
        <Spinner size={size} message={message} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spinner size={size} message={message} />
    </div>
  );
}