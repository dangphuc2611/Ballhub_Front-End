'use client';

import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-green-600 transition"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">
                {item.label}
              </span>
            )}

            {index < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
