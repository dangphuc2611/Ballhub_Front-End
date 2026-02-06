export const StatusTag = ({ label, color }: { label: string, color: string }) => {
  const styles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    orange: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${styles[color] || styles.blue}`}>
      {label}
    </span>
  );
};