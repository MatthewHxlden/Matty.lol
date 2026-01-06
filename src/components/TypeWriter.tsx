import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypeWriterProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

const TypeWriter = ({ text, delay = 50, className = "", onComplete }: TypeWriterProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, delay, text, isComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-primary"
        >
          ▌
        </motion.span>
      )}
    </span>
  );
};

export default TypeWriter;
