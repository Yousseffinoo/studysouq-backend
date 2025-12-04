import { useRef } from "react";
import { motion, useInView } from "motion/react";

export default function ScrollReveal({
  children,
  className = "",
  as: Component = motion.div,
  delay = 0,
  duration = 0.6,
  amount = 0.15,
  y = 32,
  threshold = 0.2,
  ...props
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -10% 0px",
    amount: threshold,
  });

  return (
    <Component
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

