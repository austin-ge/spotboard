import Link from "next/link";

interface DropzoneCardProps {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string | null;
  hasAdsb?: boolean;
  hasAdsbCoverage?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
}

export default function DropzoneCard({
  slug,
  name,
  lat,
  lon,
  airportCode,
  hasAdsb,
  hasAdsbCoverage,
  isFavorite,
  onToggleFavorite,
}: DropzoneCardProps) {
  return (
    <div className="relative group">
      <Link
        href={`/dz/${slug}`}
        className="block rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 hover:bg-white/[0.07] hover:border-white/[0.10] transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-3 pr-7">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[14px] text-slate-200 group-hover:text-white transition-colors truncate leading-snug">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-slate-600 font-mono">
                {Math.abs(lat).toFixed(2)}{lat >= 0 ? "N" : "S"}{" "}
                {Math.abs(lon).toFixed(2)}{lon >= 0 ? "E" : "W"}
              </span>
              {airportCode && (
                <span className="rounded-md bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                  {airportCode}
                </span>
              )}
              {hasAdsb ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 led-glow" style={{ color: "#22d3ee" }} />
                  ADS-B
                </span>
              ) : hasAdsbCoverage ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/5 border border-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-600 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-700" />
                  ADS-B
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bottom accent line — shows on hover */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(slug);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/[0.06] transition-colors z-10"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-amber-500"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
