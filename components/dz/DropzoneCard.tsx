import Link from "next/link";

interface DropzoneCardProps {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
}

export default function DropzoneCard({
  slug,
  name,
  lat,
  lon,
  airportCode,
  isFavorite,
  onToggleFavorite,
}: DropzoneCardProps) {
  return (
    <div className="relative group">
      <Link
        href={`/dz/${slug}`}
        className="block rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
              {name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">
              /dz/{slug}
            </p>
          </div>
          {airportCode && (
            <span className="flex-shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-500 tracking-wide">
              {airportCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3.5 h-3.5 text-slate-300"
          >
            <path
              fillRule="evenodd"
              d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082C12.272 10.734 13.5 8.559 13.5 6A5.5 5.5 0 0 0 2.5 6c0 2.559 1.228 4.734 2.792 6.397a15.588 15.588 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .19.153l.012.01ZM8 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs text-slate-400">
            {Math.abs(lat).toFixed(2)}&deg;{lat >= 0 ? "N" : "S"},{" "}
            {Math.abs(lon).toFixed(2)}&deg;{lon >= 0 ? "E" : "W"}
          </span>
        </div>
      </Link>

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(slug);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-10"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "text-amber-400"
                : "text-slate-300 hover:text-amber-300"
            }`}
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
