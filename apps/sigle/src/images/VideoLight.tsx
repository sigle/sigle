import type { IconProps } from "@tabler/icons-react";

export const VideoLight = ({ width = 35, height = 35 }: IconProps) => (
  <svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 35 35"
  >
    {/* Black square background */}
    <path
      d="M0 5a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5Z"
      fill="#1A1A1A"
    />
    {/* Video camera body */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 11.5C8 10.67 8.67 10 9.5 10h10c.83 0 1.5.67 1.5 1.5v3l4.4-2.2c.53-.27 1.17.11 1.17.71v9.98c0 .6-.64.98-1.17.71L21 21.5v3c0 .83-.67 1.5-1.5 1.5h-10c-.83 0-1.5-.67-1.5-1.5v-13Zm1.5 0h10v13h-10v-13Zm13 3.7v5.6l2.9 1.45v-8.5L22.5 15.2Z"
      fill="#FCFCFC"
    />
  </svg>
);
