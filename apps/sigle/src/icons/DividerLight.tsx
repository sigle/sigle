import { IconProps } from '@radix-ui/react-icons/dist/types';

export const DividerLight = ({ width = 35, height = 35 }: IconProps) => (
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
      d="M5 8a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v4H5V8Zm0 14h24v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4Zm1-6a1 1 0 1 0 0 2h22a1 1 0 1 0 0-2H6Z"
      fill="#FCFCFC"
    />
  </svg>
);
