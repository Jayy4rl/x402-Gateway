import React from "react";

interface X402LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const X402Logo: React.FC<X402LogoProps> = ({
  className = "",
  size = "md",
  showText = true,
}) => {
  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 },
    xl: { width: 160, height: 160 },
  };

  const dimensions = sizeMap[size];

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background (optional dark background) */}
      <rect x="0" y="0" width="100" height="100" fill="transparent" rx="8" />

      {/* Border Box */}
      <rect
        x="10"
        y="15"
        width="80"
        height="70"
        fill="none"
        stroke="#0891B2"
        strokeWidth="2.5"
        rx="3"
      />

      {/* Connection Lines - API Routing Symbol */}
      <g transform="translate(22, 30)">
        {/* Top circle - BOLDER */}
        <circle
          cx="0"
          cy="0"
          r="3.5"
          fill="#0891B2"
          stroke="#0891B2"
          strokeWidth="1"
        />

        {/* Horizontal line to right - BOLDER */}
        <line x1="3.5" y1="0" x2="22" y2="0" stroke="#0891B2" strokeWidth="3" />

        {/* Vertical line down - BOLDER */}
        <line x1="22" y1="0" x2="22" y2="8" stroke="#0891B2" strokeWidth="3" />

        {/* Text "402" - BOLDER & BIGGER */}
        <text
          x="27"
          y="4.5"
          fill="#0891B2"
          fontSize="11"
          fontFamily="monospace, 'Courier New'"
          fontWeight="900"
          letterSpacing="1.5"
        >
          402
        </text>

        {/* Middle circle - BOLDER */}
        <circle
          cx="0"
          cy="15"
          r="3.5"
          fill="#0891B2"
          stroke="#0891B2"
          strokeWidth="1"
        />

        {/* Horizontal line to right - BOLDER */}
        <line
          x1="3.5"
          y1="15"
          x2="22"
          y2="15"
          stroke="#0891B2"
          strokeWidth="3"
        />

        {/* Vertical line down from previous - BOLDER */}
        <line x1="22" y1="8" x2="22" y2="21" stroke="#0891B2" strokeWidth="3" />

        {/* Bottom circle - BOLDER */}
        <circle
          cx="0"
          cy="30"
          r="3.5"
          fill="#0891B2"
          stroke="#0891B2"
          strokeWidth="1"
        />

        {/* Horizontal line to right - BOLDER */}
        <line
          x1="3.5"
          y1="30"
          x2="22"
          y2="30"
          stroke="#0891B2"
          strokeWidth="3"
        />

        {/* Vertical line down from previous - BOLDER */}
        <line
          x1="22"
          y1="21"
          x2="22"
          y2="30"
          stroke="#0891B2"
          strokeWidth="3"
        />
      </g>

      {/* Brand Text - BOLDER */}
      {showText && (
        <text
          x="50"
          y="75"
          fill="#0891B2"
          fontSize="12"
          fontFamily="monospace, 'Courier New'"
          fontWeight="900"
          letterSpacing="3"
          textAnchor="middle"
        >
          X402
        </text>
      )}
    </svg>
  );
};

export default X402Logo;
