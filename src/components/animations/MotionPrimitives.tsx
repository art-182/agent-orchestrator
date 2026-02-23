import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import React from "react";

// Stagger children container
export const StaggerContainer = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.06 } },
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
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
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
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale on hover card wrapper
export const HoverCard = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
  <motion.div
    whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.99 }}
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
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={className}
  >
    {value}
  </motion.span>
);
