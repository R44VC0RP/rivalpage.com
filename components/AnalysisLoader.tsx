"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisLoaderProps {
  duration?: number;
  onComplete?: () => void;
}

const LOADING_STEPS = [
  "Searching out competitors...",
  "Finding brand screenshots...",
  "Analyzing visual identity...",
  "Generating insights...",
];

export function AnalysisLoader({ duration = 3000, onComplete }: AnalysisLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  
  // Calculate how long each step should show based on total duration
  const stepDuration = duration / LOADING_STEPS.length;

  useEffect(() => {
    if (stepIndex < LOADING_STEPS.length) {
      const timer = setTimeout(() => {
        if (stepIndex === LOADING_STEPS.length - 1) {
          onComplete?.();
        } else {
          setStepIndex((prev) => prev + 1);
        }
      }, stepDuration);
      
      return () => clearTimeout(timer);
    }
  }, [stepIndex, stepDuration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-8 max-w-md px-6 text-center">
        {/* Minimalistic Spinner/Animation */}
        <div className="relative flex items-center justify-center size-16">
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Text Cycler */}
        <div className="h-8 relative flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-medium text-muted-foreground font-heading"
            >
              {LOADING_STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

