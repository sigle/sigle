import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-16">
      <div className="flex flex-col justify-center text-center">
        <h2 className="text-5xl font-bold">404 Not Found</h2>
        <p className="mt-2">Sorry, but this page doesn’t exist.</p>
        <Link
          className="mx-auto mt-5 flex items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-white"
          href="/"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}
