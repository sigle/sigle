import type { IconProps } from "@tabler/icons-react";

/** The Bitcoin sign in a circle, drawn like ArweaveLogo so both match. */
export const BitcoinLogo = ({
  width = 35,
  height = 35,
  color = "currentColor",
}: IconProps) => (
  <svg
    width={width}
    height={height}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 31.8 31.8"
    fill="none"
    stroke={color}
  >
    <circle cx={15.9} cy={15.9} r={14.7} strokeWidth={2.5} />
    {/* The Tabler currency-bitcoin icon, centered in the circle. */}
    <g
      transform="translate(15.9 15.9) scale(0.8) translate(-11.5 -12)"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6h8a3 3 0 0 1 0 6a3 3 0 0 1 0 6h-8" />
      <path d="M8 6v12M8 12h6M9 3v3M13 3v3M9 18v3M13 18v3" />
    </g>
  </svg>
);
