import { cn } from "@/lib/utils/cn";
import { easeIn, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
type CardProps = {
  children: React.ReactNode;
  className?: string;
  isAnimated?: boolean;
};
const boxVariant = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easeIn },
  },
  hidden: { opacity: 0, scale: 0.5 },
};

export default function Card({
  children,
  className,
  isAnimated = false,
}: CardProps) {
  const controls = useAnimation();
  const control = useAnimation();
  const [ref, inView] = useInView();
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);
  return (
    <motion.div
      className={cn(
        "relative z-10 rounded-lg border-2 border-neutral-200 bg-neutral-100 p-4 transition-all duration-300 hover:scale-105 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
      ref={ref}
      variants={boxVariant}
      initial={isAnimated ? "hidden" : "visible"}
      animate={isAnimated && controls}
      onHoverStart={() => {
        control.set({ opacity: 1 });
        control.start("animate");
      }}
      onHoverEnd={() => control.set({ opacity: 0 })}
    >
      {isAnimated && (
        <motion.span
          className={`absolute inset-0 block h-[150%] w-[150%] opacity-0 ${!isAnimated && "hidden"}`}
          style={{
            background: "conic-gradient(#A3547A 90deg,transparent 90deg)",
            left: "24%",
          }}
          animate={isAnimated && control}
          variants={{
            animate: {
              top: ["-74%", "25%", "50%", "99%", "99%", "0%", "-74%", "-74%"],
              left: [
                "24%",
                "24%",
                "24%",
                "24%",
                "-149%",
                "-149%",
                "-149%",
                "24%",
              ],
              transition: { duration: 3, repeat: Infinity, ease: "linear" },
            },
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
