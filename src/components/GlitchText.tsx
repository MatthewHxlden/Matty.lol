import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText = ({ text, className = "" }: GlitchTextProps) => {
  return (
    <motion.span
      className={`glitch relative inline-block ${className}`}
      data-text={text}
      whileHover={{ scale: 1.02 }}
    >
      {text}
    </motion.span>
  );
};

export default GlitchText;
