export default function CardSkeleton({ index }: { index: number }) {
  return (
    <div className="min-w-0 animate-pulse" aria-hidden="true" style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}>
      <div className="aspect-[2/3] rounded-xl border border-border-primary bg-background-tertiary" />
      <div className="mt-3 h-3.5 w-4/5 rounded bg-background-tertiary" />
      <div className="mt-2 h-3 w-1/3 rounded bg-background-tertiary" />
    </div>
  );
}
