"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { MorphingText } from "@/components/ui/morphing-text";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryState, parseAsInteger } from "nuqs";
import { getAnalysisByDomain } from "@/app/actions/get-analysis";

export default function Home() {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(0));
  const [website, setWebsite] = useQueryState("website", { defaultValue: "" });
  const [name, setName] = useQueryState("name", { defaultValue: "" });
  const [email, setEmail] = useQueryState("email", { defaultValue: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const cleanDomain = (domain: string): string => {
    let cleaned = domain.trim().toLowerCase();
    cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, "");
    cleaned = cleaned.replace(/\/.*$/, "");
    return cleaned;
  };

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    return domainRegex.test(domain);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess(false);

    if (step === 0) {
      if (!website.trim()) {
        setError("Please enter a domain");
        return;
      }
      const cleaned = cleanDomain(website);
      if (!validateDomain(cleaned)) {
        setError("Please enter a valid domain (e.g., example.com)");
        return;
      }
      
      // Check if analysis already exists for this domain
      try {
        const existingAnalysis = await getAnalysisByDomain(cleaned);
        
        if (existingAnalysis) {
          // Redirect to existing analysis page
          router.push(`/analysis/${encodeURIComponent(cleaned)}`);
          return;
        }
      } catch (error) {
        console.error("Error checking for existing analysis:", error);
        // Continue with normal flow if check fails
      }
      
      // No existing analysis found, continue to collect user info
      await setWebsite(cleaned);
      await setStep(1);
    } else if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      await setStep(2);
    } else if (step === 2) {
      if (!email.trim()) {
        setError("Please enter your email");
        return;
      }
      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }
      
      // Submit final form
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: website,
            name: name,
            email: email,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to start analysis");
        }

        // Show success message and reset form
        setSuccess(true);
        setTimeout(async () => {
          await setStep(0);
          await setWebsite("");
          await setName("");
          await setEmail("");
          setSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error submitting analysis:", error);
        setError("Failed to start analysis. Please try again.");
      }
    }
  };

  const steps = [
    {
      id: "website",
      label: "Your Website URL",
      placeholder: "example.com",
      value: website,
      type: "text",
      buttonText: "Analyze Competitors",
      icon: <IconSearch size={20} stroke={3} />,
    },
    {
      id: "name",
      label: "What's your name?",
      placeholder: "Jane Doe",
      value: name,
      type: "text",
      buttonText: "Continue",
      icon: <IconArrowRight size={20} stroke={3} />,
    },
    {
      id: "email",
      label: "Where should we send your analysis?",
      placeholder: "jane@company.com",
      value: email,
      type: "email",
      buttonText: "Send Analysis",
      icon: <IconCheck size={20} stroke={3} />,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20">
      <main className="flex flex-col gap-12 max-w-2xl w-full items-center text-center">
        
        <div className="space-y-6">
          <div className="flex justify-center">
             <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-[rgb(255,252,236)] font-mono text-[12px] font-bold uppercase tracking-wide">
               Competitor Analysis
             </span>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <MorphingText
              texts={[
                "See what your rivals are up to.",
                "Track competitor moves.",
                "See what the market is doing."
              ]}
              className="text-[40px] leading-[1.2] font-heading font-bold text-primary"
              morphTime={1}
              cooldownTime={3}
            />
          </div>
          
          <p className="text-[17px] leading-[26px] font-sans font-medium text-[#696969] max-w-lg mx-auto">
            Enter your website to instantly uncover your competitors' strategies, landing pages, and blog structures.
          </p>
        </div>

        <div className="w-full max-w-md min-h-[140px]">
          <form onSubmit={handleNext} className="flex flex-col gap-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col text-left gap-2 w-full"
              >
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <motion.label 
                    htmlFor={currentStep.id} 
                    className="text-[12px] font-mono font-bold text-[#696969] uppercase whitespace-nowrap"
                  >
                    {currentStep.label}
                  </motion.label>
                  {(error || success) && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[12px] font-bold whitespace-nowrap ${success ? 'text-green-600' : 'text-destructive'}`}
                    >
                      {success ? 'Analysis queued! Check your email.' : error}
                    </motion.span>
                  )}
                </div>
                <Input
                  id={currentStep.id}
                  type={currentStep.type}
                  placeholder={currentStep.placeholder}
                  value={currentStep.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (currentStep.id === "website") {
                      setWebsite(value);
                    } else if (currentStep.id === "name") {
                      setName(value);
                    } else if (currentStep.id === "email") {
                      setEmail(value);
                    }
                    setError("");
                  }}
                  autoFocus
                  className="w-full transition-all duration-300"
                  aria-invalid={error ? true : undefined}
                />
              </motion.div>
            </AnimatePresence>

            <Button
              type="submit"
              className="mt-2 w-full h-auto py-3 text-[17px] cursor-pointer bg-[url('/noise-light.png')] bg-[length:100px_100px] bg-repeat"
            >
              {step === 0 ? <IconSearch size={20} stroke={3} /> : 
               step === 1 ? <IconArrowRight size={20} stroke={3} /> : 
               <IconCheck size={20} stroke={3} />}
              {currentStep.buttonText}
            </Button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full text-left mt-8">
          <div className="space-y-2">
             <span className="text-[12px] font-mono font-bold text-primary uppercase">
               Landing Pages
             </span>
             <p className="text-[15px] leading-relaxed text-[#696969]">
               Visualize how competitors structure their landing pages to convert visitors.
             </p>
          </div>
          <div className="space-y-2">
             <span className="text-[12px] font-mono font-bold text-primary uppercase">
               Content Strategy
             </span>
             <p className="text-[15px] leading-relaxed text-[#696969]">
               Understand their blog topics, cadence, and SEO approach.
             </p>
          </div>
        </div>

      </main>
    </div>
  );
}

