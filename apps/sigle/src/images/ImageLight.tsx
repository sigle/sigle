import type { IconProps } from "@tabler/icons-react";

export const ImageLight = ({ width = 35, height = 35 }: IconProps) => (
  <svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 35 35"
  >
    <path
      d="M0 5a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5Z"
      fill="#1A1A1A"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M25 13.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-20.5 16h24l-6.857-10.615-4.714 5.076-6-12.461-6.429 18Z"
      fill="#FCFCFC"
    />
  </svg>
);
