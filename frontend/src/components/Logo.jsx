export default function Logo({ className, ...props }) {
  return (
    <img
      src="/logo.png"
      alt="StudySouq logo"
      className={className || "object-contain"}
      {...props}
    />
  );
}
