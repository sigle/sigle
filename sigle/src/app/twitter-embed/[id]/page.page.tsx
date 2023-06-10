import { Tweet } from 'react-tweet';

export const revalidate = 3600;
export const runtime = 'edge';

type Props = {
  params: { id: string };
};

/**
 * We generate tweets on a separate page so they can then be screenshotted, and inserted as images
 * in the emails sent to subscribers.
 */
export default function Page({ params }: Props) {
  return (
    <div data-theme="light">
      <Tweet id={params.id} />
    </div>
  );
}
