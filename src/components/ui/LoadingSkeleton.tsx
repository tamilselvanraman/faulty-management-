export default function LoadingSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-[#E5E7EB]">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded-lg flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
      <div className="h-10 w-10 bg-gray-100 rounded-xl" />
      <div className="h-6 bg-gray-100 rounded-lg w-1/2 mt-4" />
      <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
    </div>
  )
}
