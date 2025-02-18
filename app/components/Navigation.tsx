import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="border-b border-gray-300 text-gray-900 p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="hover:text-gray-300">
          Shop
        </Link>
        <Link href="/admin" className="hover:text-gray-300">
          Admin
        </Link>
      </div>
    </nav>
  );
}
