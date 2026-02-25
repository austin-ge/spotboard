import Link from "next/link";

interface DropzoneCardProps {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string | null;
}

export default function DropzoneCard({
  slug,
  name,
  airportCode,
}: DropzoneCardProps) {
  return (
    <Link
      href={`/dz/${slug}`}
      className="group block rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
        {name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        {airportCode && (
          <span className="text-xs font-mono text-gray-400">
            {airportCode}
          </span>
        )}
        <span className="text-xs text-gray-400">/dz/{slug}</span>
      </div>
    </Link>
  );
}
