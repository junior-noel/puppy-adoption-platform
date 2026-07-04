// Loading placeholder that matches the PuppyCard dimensions
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-amber-100">
    <div className="aspect-square skeleton" />
    <div className="p-3 space-y-2">
      <div className="skeleton h-4 w-2/3 rounded-full" />
      <div className="skeleton h-3 w-1/2 rounded-full" />
      <div className="skeleton h-3 w-1/3 rounded-full" />
    </div>
  </div>
);

export default SkeletonCard;
