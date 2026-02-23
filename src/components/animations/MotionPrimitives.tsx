import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import React from "react";

const spring = { type: "spring", stiffness: 300, damping: 30 };

// Stagger children container
export const StaggerContainer = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Fade-up item (for use inside StaggerContainer)
export const FadeIn = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Page wrapper with fade transition
export const PageTransition = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale on hover card wrapper
export const HoverCard = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    whileHover={{ scale: 1.02, transition: { duration: 0.25, ease: "easeOut" } }}
    whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Count-up number display
export const AnimatedNumber = ({ value, className }: { value: string; className?: string }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {value}
  </motion.span>
);
