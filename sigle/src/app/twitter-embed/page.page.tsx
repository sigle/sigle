import { Tweet } from 'react-tweet';

// export const revalidate = 3600;
export const runtime = 'edge';

export default function Page() {
  const id = '1634630749650317314';

  return (
    <div data-theme="light">
      <Tweet id={id} />
    </div>
  );
}
