export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-xl animate-pulse">

      {/* image skeleton */}
      <div className="relative bg-gray-200 rounded-xl aspect-square mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      </div>

      {/* text skeleton */}
      <div className="flex-1 flex flex-col px-1 gap-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />

        <div className="mt-auto space-y-2">
          <div className="h-5 bg-gray-300 rounded w-2/5" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
