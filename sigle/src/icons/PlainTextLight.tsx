import { IconProps } from '@radix-ui/react-icons/dist/types';

export const PlainTextLight = ({ width = 35, height = 35 }: IconProps) => (
  <svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 35 35"
  >
    <rect
      x=".473"
      y=".946"
      width="28.001"
      height="28.001"
      rx="4"
      fill="#1A1A1A"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.58 11.053a.687.687 0 0 1-.687-.686V8h-4.58v13.891h1.839a.687.687 0 0 1 0 1.374h-5.344a.687.687 0 0 1 0-1.374h1.826V8.001h-4.58v2.366a.687.687 0 0 1-1.374 0V7.313a.687.687 0 0 1 .716-.686h12.155l.029-.001c.322 0 .593.222.667.522l.002.01c.012.05.018.102.018.156v3.053c0 .379-.308.686-.687.686Z"
      fill="#FCFCFC"
    />
  </svg>
);
