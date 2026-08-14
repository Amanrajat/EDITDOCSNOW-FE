import { Skeleton } from "@astryxdesign/core/Skeleton";

export function SkeletonViewer() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white/5 p-8">
      <div className="flex w-full max-w-xl flex-col items-center gap-3">
        <Skeleton width="100%" height={720} radius={3} index={0} />
        <div className="flex w-full items-center justify-between">
          <Skeleton width={120} height={16} index={1} />
          <Skeleton width={80} height={16} index={2} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlockList({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <Skeleton width="40%" height={12} radius={1} index={index} />
          <Skeleton width="100%" height={36} radius={2} index={index + 1} />
        </div>
      ))}
    </div>
  );
}
