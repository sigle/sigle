import { Tweet } from 'react-tweet';

// export const revalidate = 3600;
export const runtime = 'edge';

/**
 * We generate tweets on a separate page so they can then be screenshotted, and inserted as images
 * in the emails sent to subscribers.
 */
export default function Page() {
  const id = '1634630749650317314';

  return (
    <div data-theme="light">
      <Tweet id={id} />
    </div>
  );
}
