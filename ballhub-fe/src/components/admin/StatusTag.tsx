export const StatusTag = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    orange: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    gray: "bg-slate-50 text-slate-600 border-slate-200",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  // Determine color based on label if color is not explicitly matching
  let resolvedColor = color;
  if (!styles[color]) {
    switch (label) {
      case "PENDING":
        resolvedColor = "orange";
        break;
      case "CONFIRMED":
      case "SHIPPING":
        resolvedColor = "blue";
        break;
      case "DELIVERED":
        resolvedColor = "green";
        break;
      case "CANCELLED":
        resolvedColor = "gray";
        break;
      case "RETURNED":
        resolvedColor = "red";
        break;
      default:
        resolvedColor = "blue";
    }
  }

  return (
    <span
      className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${styles[resolvedColor] || styles.blue}`}
    >
      {label}
    </span>
  );
};
