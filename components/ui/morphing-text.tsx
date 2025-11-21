"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingTextProps {
  texts: string[];
  className?: string;
  morphTime?: number;
  cooldownTime?: number;
}

export function MorphingText({
  texts,
  className,
  morphTime = 1.5,
  cooldownTime = 3,
}: MorphingTextProps) {
  const [index, setIndex] = useState(0);
  const [isMorphing, setIsMorphing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, (morphTime + cooldownTime) * 1000);

    return () => clearInterval(interval);
  }, [texts.length, morphTime, cooldownTime]);

  useEffect(() => {
    setIsMorphing(true);
    const timer = setTimeout(() => {
      setIsMorphing(false);
    }, morphTime * 1000);

    return () => clearTimeout(timer);
  }, [index, morphTime]);

  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Invisible text to maintain layout width/height based on the longest text or current text */}
      <span className="opacity-0 pointer-events-none w-full" aria-hidden="true">
        {texts.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>

      {/* Filter definition */}
      <svg className="absolute size-0 pointer-events-none">
        <defs>
          <filter id="morph-goo">
            <feColorMatrix
              in="SourceGraphic"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: isMorphing ? "url(#morph-goo)" : "none" }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={texts[index]}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{
              duration: morphTime,
              ease: "easeInOut",
            }}
            className={cn("absolute inset-0 flex items-center justify-center text-center", className)}
          >
            {texts[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
