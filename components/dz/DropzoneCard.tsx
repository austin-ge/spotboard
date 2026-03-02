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
  lat,
  lon,
  airportCode,
}: DropzoneCardProps) {
  return (
    <Link
      href={`/dz/${slug}`}
      className="group block rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
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
  );
}
