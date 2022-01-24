import { IconProps } from '@radix-ui/react-icons/dist/types';

export const RoundPlus = ({ width = 27, height = 27 }: IconProps) => (
  <svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.75 8.5a.5.5 0 0 0-1 0v4.25H8.5a.5.5 0 0 0 0 1h4.25V18a.5.5 0 0 0 1 0v-4.25H18a.5.5 0 0 0 0-1h-4.25V8.5Z"
      fill="currentColor"
    />
    <rect
      x={0.5}
      y={0.5}
      width={25.5}
      height={25.5}
      rx={12.75}
      stroke="currentColor"
    />
  </svg>
);
