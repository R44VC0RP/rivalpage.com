"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnalysisLoader } from "@/components/AnalysisLoader";

// Mock Data
const COMPETITORS = [
  {
    id: 1,
    name: "Brew & Bean",
    url: "brewandbean.com",
    title: "Artisan Coffee Subscription | Fresh Roasted Daily",
    images: [
      { src: "/placeholder.svg?height=600&width=800", label: "/root" },
      { src: "/placeholder.svg?height=600&width=800", label: "/shop" },
      { src: "/placeholder.svg?height=600&width=800", label: "/blog/brewing-guide" },
      { src: "/placeholder.svg?height=600&width=800", label: "/about" },
      { src: "/placeholder.svg?height=600&width=800", label: "/subscription" },
    ],
    rank: 1,
    analysis: "Brew & Bean's strength lies in its minimalist aesthetic and focus on product freshness. The user journey is streamlined for subscription conversion."
  },
  {
    id: 2,
    name: "GreenRoast",
    url: "greenroast.co",
    title: "Sustainable Coffee for a Better Planet",
    images: [
      { src: "/placeholder.svg?height=600&width=800", label: "/root" },
      { src: "/placeholder.svg?height=600&width=800", label: "/impact" },
      { src: "/placeholder.svg?height=600&width=800", label: "/products" },
      { src: "/placeholder.svg?height=600&width=800", label: "/blog" },
    ],
    rank: 2,
    analysis: "GreenRoast effectively leverages social proof and detailed sustainability reports to build trust. Their color palette reinforces their eco-friendly mission."
  },
  {
    id: 3,
    name: "Morning Joy",
    url: "morningjoycoffee.com",
    title: "Start Your Day Right - Morning Joy Coffee",
    images: [
      { src: "/placeholder.svg?height=600&width=800", label: "/root" },
      { src: "/placeholder.svg?height=600&width=800", label: "/instagram-feed" },
      { src: "/placeholder.svg?height=600&width=800", label: "/shop/bundles" },
      { src: "/placeholder.svg?height=600&width=800", label: "/reviews" },
      { src: "/placeholder.svg?height=600&width=800", label: "/contact" },
    ],
    rank: 3,
    analysis: "Morning Joy targets a younger demographic with high-energy visuals and prominent social media integration. The tone is casual and inviting."
  },
];

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<number | null>(null);
  const router = useRouter();

  const handleImageClick = (img: string, competitorId: number) => {
    setSelectedImage(img);
    setSelectedCompetitorId(competitorId);
  };

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedImage) {
          setSelectedImage(null);
        } else {
          router.push("/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, router]);

  const activeCompetitor = COMPETITORS.find(c => c.id === selectedCompetitorId);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-10 font-sans text-foreground">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50"
          >
            <AnalysisLoader onComplete={() => setIsLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Navigation */}
      <header className="mb-8 flex items-start">
        <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to search
        </Link>
      </header>

      <main className="flex flex-col gap-12 max-w-full">
        
        <div className="flex flex-col gap-12">
          {COMPETITORS.map((competitor) => (
            <div key={competitor.id} className="flex flex-col gap-4 group">
              {/* Competitor Header Info */}
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wide">
                    #{competitor.rank} Threat
                  </span>
                  <a 
                    href={`https://${competitor.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-bold text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                  >
                    {competitor.url}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 className="text-xl font-heading font-bold text-primary whitespace-nowrap">
                    {competitor.name}
                  </h2>
                  <h3 className="text-base font-medium text-muted-foreground line-clamp-1">
                    {competitor.title}
                  </h3>
                </div>
              </div>

              {/* Screenshots Gallery */}
              <div className="flex gap-4 overflow-x-auto pb-8 pt-2 snap-x scrollbar-hide -mx-6 px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
                {competitor.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImageClick(img.src, competitor.id)}
                    className="relative flex-none w-[280px] aspect-[4/3] rounded-[24px] corner-squircle border border-border/50 bg-muted transition-all cursor-zoom-in group/image snap-start"
                  >
                    <div className="absolute inset-0 rounded-[24px] corner-squircle overflow-hidden z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground/30">
                         <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="font-mono text-xs">Screenshot {idx + 1}</span>
                         </div>
                      </div>
                      {/* Hover Overlay Label */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                        <span className="bg-background/80 backdrop-blur-md text-primary px-3 py-1.5 rounded-full font-mono text-[11px] font-bold shadow-sm border border-primary/10">
                          {img.label}
                        </span>
                      </div>
                    </div> 
                    {/* Hover ring drawn above content to avoid clipping */}
                    <span className="pointer-events-none absolute inset-0 rounded-[24px] corner-squircle border-2 border-primary/20 opacity-0 group-hover/image:opacity-100 transition-opacity z-10"></span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Overlay */}
      {selectedImage && activeCompetitor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-50"
            onClick={() => setSelectedImage(null)}
          >
            <X className="size-8" />
          </button>
          
          <div 
            className="w-full max-w-6xl h-[85vh] flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden bg-transparent rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image Area */}
            <div className="flex-1 relative bg-muted rounded-[24px] corner-squircle overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="w-full h-full bg-gray-100 flex items-center justify-center text-muted-foreground">
                  <span className="font-mono text-lg">Full Size View</span>
               </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-[320px] flex-none flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wide">
                      #{activeCompetitor.rank} Threat
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-primary leading-tight">
                      {activeCompetitor.name}
                    </h2>
                    <a href={`https://${activeCompetitor.url}`} className="text-sm font-mono text-muted-foreground hover:text-primary hover:underline block mt-1">
                      {activeCompetitor.url}
                    </a>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-[24px] corner-squircle border border-border/50">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase mb-2 block">
                      AI Analysis
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeCompetitor.analysis}
                    </p>
                  </div>
               </div>

               <div className="space-y-3">
                 <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                    Other Views
                 </span>
                  <div className="flex flex-col gap-3">
                   {activeCompetitor.images.map((img, idx) => (
                     <button
                       key={idx}
                       onClick={() => setSelectedImage(img.src)}
                       className="group relative w-full aspect-[16/9] rounded-[24px] corner-squircle transition-all"
                     >
                        <div className="absolute inset-0 rounded-[24px] corner-squircle overflow-hidden bg-muted z-0">
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                             <span className="font-mono text-[10px] text-muted-foreground/50">{img.label}</span>
                          </div>
                        </div>
                        {/* Selection/hover outline above, never clipped */}
                        <span className={cn(
                          "pointer-events-none absolute inset-0 rounded-[24px] corner-squircle border-2 transition-opacity",
                          selectedImage === img.src ? "opacity-100 border-primary" : "opacity-0 group-hover:opacity-100 border-primary/20"
                        )}></span>
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
