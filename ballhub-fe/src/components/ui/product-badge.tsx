interface ProductBadgeProps {
  type: "new" | "discount" | "authentic" | "bestseller";
  label: string;
}

export function ProductBadge({ type, label }: ProductBadgeProps) {
  const badgeStyles = {
    new: "bg-blue-500 text-white",
    discount: "bg-red-500 text-white",
    authentic: "bg-green-500 text-white",
    bestseller: "bg-emerald-500 text-white",
  };

  return (
    <div
      className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[type]}`}
    >
      {label}
    </div>
  );
}
