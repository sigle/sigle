import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

export const HeaderLogo = () => {
  const { resolvedTheme } = useTheme();

  let src;
  switch (resolvedTheme) {
    case 'dark':
      src = '/static/img/logo_white.png';
      break;
    default:
      src = '/static/img/logo.png';
      break;
  }

  return (
    <Link href="/">
      <Image width={93} height={34} src={src} alt="logo" />
    </Link>
  );
};
