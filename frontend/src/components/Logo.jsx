import { cn } from "./ui/utils";

export default function Logo({ className, ...props }) {
  return (
    <img
      src="/favicon.png"
      alt="StudySouq logo"
      className={cn(
        "object-contain filter brightness-[1.35] saturate-125 contrast-110 drop-shadow-[0_4px_20px_rgba(22,49,98,0.35)]",
        className,
      )}
      {...props}
    />
  );
}

