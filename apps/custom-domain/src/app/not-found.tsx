import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-16">
      <div className="flex flex-col justify-center text-center">
        <h2 className="text-5xl	font-bold">404 Not Found</h2>
        <p className="mt-2">Sorry, but this page doesn’t exist.</p>
        <Link
          className="px-4 py-3 flex justify-center items-center rounded-lg bg-gray-900 text-white mx-auto mt-5"
          href="/"
        >
          Take me home, to the place I belong
        </Link>
      </div>
    </div>
  );
}
