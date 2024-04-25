import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-slate-800 min-h-screen bg-white">
      <nav className="flex px-12 py-6">
        <div className="flex-grow">
          <span className="font-bold text-xl">Planning Poker Clone</span>
        </div>
      </nav>
      <div className="mt-48 ml-72 mr-auto max-w-fit">
        <div className="flex flex-col justify-center">
          <span className="text-9xl font-black">404</span>
          <h2 className="mt-6 font-bold text-4xl tracking-wider">
            Page Not Found
          </h2>
          <p className="mt-3 tracking-wider">
            Sorry, we can’t find what you are looking for.
          </p>
          <Link
            href="/public"
            className="mt-10 py-3 text-white bg-blue-500 hover:bg-blue-400 rounded-lg font-bold text-center tracking-wider"
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
