import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-qosf-blue mb-4">404</h1>
      <p className="text-xl text-qosf-text-light mb-6">
        Page not found
      </p>
      <Link href="/" className="btn-secondary">
        Go Home
      </Link>
    </div>
  );
}
