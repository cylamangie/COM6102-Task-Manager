import React from "react";

interface ChipProps {
  colorClass: string;
  children: React.ReactNode;
  className?: string;
}

const Chip = ({ colorClass, children, className = "" }: ChipProps) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${colorClass} ${className}`.trim()}
  >
    {children}
  </span>
);

export default Chip;
