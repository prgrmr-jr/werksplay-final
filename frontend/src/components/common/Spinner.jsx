export default function Spinner({ size = "md" }) {
  const s = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className="flex justify-center items-center py-10">
      <div className={`${s} border-2 border-cyan/20 border-t-cyan rounded-full animate-spin`} />
    </div>
  );
}
