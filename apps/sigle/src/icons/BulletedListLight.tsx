import { IconProps } from '@radix-ui/react-icons/dist/types';

export const BulletedListLight = ({ width = 35, height = 35 }: IconProps) => (
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
      d="M5.267 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm5.066-3a1 1 0 1 0 0 2h19.4a1 1 0 0 0 0-2h-19.4Zm0 7.133a1 1 0 1 0 0 2h19.4a1 1 0 0 0 0-2h-19.4Zm-1 7.8a1 1 0 0 1 1-1h19.4a1 1 0 0 1 0 2h-19.4a1 1 0 0 1-1-1ZM7.267 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      fill="#FCFCFC"
    />
  </svg>
);
