// Kartë "skeleton" — placeholder animuar ndërsa të dhënat ngarkohen,
// në vend të tekstit të thjeshtë "Duke ngarkuar..."
export default function SkeletonCard({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
