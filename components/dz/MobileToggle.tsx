"use client";

interface MobileToggleProps {
  showMap: boolean;
  onToggle: () => void;
}

export default function MobileToggle({
  showMap,
  onToggle,
}: MobileToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 md:hidden rounded-full bg-gray-900 text-white w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      aria-label={showMap ? "Show winds" : "Show map"}
    >
      <span className="text-xl">{showMap ? "☰" : "🗺"}</span>
    </button>
  );
}
