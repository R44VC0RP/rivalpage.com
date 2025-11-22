"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { getAnalysisByDomain, type AnalysisData } from "@/app/actions/get-analysis";

export default function DomainAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const domain = typeof params.domain === "string" ? decodeURIComponent(params.domain) : "";
  
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState<number | null>(null);
  
  // Use ref to track latest analysis data without triggering effect re-runs
  const analysisDataRef = useRef<AnalysisData | null>(null);
  analysisDataRef.current = analysisData;

  const fetchAnalysis = useCallback(async () => {
    if (!domain) return;
    
    try {
      const data = await getAnalysisByDomain(domain);
      setAnalysisData(data);
      
      if (data?.status === "completed" || data?.status === "failed") {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    // Initial fetch
    fetchAnalysis();

    // Set up polling - check ref to avoid dependency on analysisData
    const intervalId = setInterval(() => {
      const currentData = analysisDataRef.current;
      if (!currentData || currentData.status === "pending") {
        fetchAnalysis();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchAnalysis]);

  const handleImageClick = (img: string, competitorIndex: number) => {
    setSelectedImage(img);
    setSelectedCompetitorIndex(competitorIndex);
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

  // Helper to clean URL for display
  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  };

  // Helper to get path label from URL
  const getPathLabel = (fullUrl: string, baseUrl: string) => {
    try {
      const urlObj = new URL(fullUrl);
      return urlObj.pathname === "/" ? "/root" : urlObj.pathname;
    } catch {
      return "/page";
    }
  };

  if (!domain){
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">No Domain Provided</h1>
          <p className="text-muted-foreground">
            Please provide a domain to analyze.
          </p>
        </div>
      </div>
    );
  }

  // Show loader if strictly loading (initial fetch) or if analysis is pending
  const showLoader = isLoading || (analysisData?.status === "pending");

  if (analysisData?.status === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <AlertCircle className="size-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Analysis Failed</h1>
          <p className="text-muted-foreground">
            We couldn't complete the analysis for {domain}. Please try again later.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!showLoader && !analysisData) {
     return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">No Analysis Found</h1>
          <p className="text-muted-foreground">
            We couldn't find any analysis for {domain}.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const activeCompetitor = selectedCompetitorIndex !== null && analysisData?.result?.competitors 
    ? analysisData.result.competitors[selectedCompetitorIndex] 
    : null;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-10 font-sans text-foreground">
      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50"
          >
            <AnalysisLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content only visible when not loading/pending */}
      {!showLoader && analysisData?.result && (
        <>
          {/* Header / Navigation */}
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Back to search
            </Link>
            <div className="text-sm text-muted-foreground font-mono">
              Analysis for <span className="text-primary font-bold">{domain}</span>
            </div>
          </header>

          <main className="flex flex-col gap-12 max-w-full">
            
            <div className="flex flex-col gap-12">
              {analysisData.result.competitors.map((competitor, idx) => (
                <div key={idx} className="flex flex-col gap-4 group">
                  {/* Competitor Header Info */}
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wide">
                        #{idx + 1} Threat
                      </span>
                      <a 
                        href={competitor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                      >
                        {formatUrl(competitor.website)}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                    
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h2 className="text-xl font-heading font-bold text-primary whitespace-nowrap">
                        {competitor.name}
                      </h2>
                      <h3 className="text-base font-medium text-muted-foreground line-clamp-1 max-w-2xl">
                        {competitor.description}
                      </h3>
                    </div>
                  </div>

                  {/* Screenshots Gallery */}
                  <div className="flex gap-4 overflow-x-auto pb-8 pt-2 snap-x scrollbar-hide -mx-6 px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
                    {competitor.screenshots && competitor.screenshots.length > 0 ? (
                      competitor.screenshots.map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          onClick={() => handleImageClick(img.imageUrl, idx)}
                          className="relative flex-none w-[280px] aspect-[4/3] rounded-[24px] corner-squircle border border-border/50 bg-muted transition-all cursor-zoom-in group/image snap-start overflow-hidden"
                        >
                          <div className="absolute inset-0 rounded-[24px] corner-squircle overflow-hidden z-0 scale-110 -translate-y-[5%]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={img.imageUrl} 
                              alt={`Screenshot of ${competitor.name}`}
                              className="w-full h-full object-cover object-[center_10%]"
                              loading="lazy"
                            />
                            
                            {/* Hover Overlay Label */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-10 pointer-events-none bg-black/20">
                              <span className="bg-background/90 backdrop-blur-md text-primary px-3 py-1.5 rounded-full font-mono text-[11px] font-bold shadow-sm border border-primary/10">
                                {getPathLabel(img.url, competitor.website)}
                              </span>
                            </div>
                          </div> 
                          {/* Hover ring drawn above content to avoid clipping */}
                          <span className="pointer-events-none absolute inset-0 rounded-[24px] corner-squircle border-2 border-primary/20 opacity-0 group-hover/image:opacity-100 transition-opacity z-10"></span>
                        </button>
                      ))
                    ) : (
                       <div className="w-[280px] flex-none aspect-[4/3] rounded-[24px] corner-squircle border border-dashed border-border bg-muted/30 flex items-center justify-center text-muted-foreground text-sm font-mono">
                          No screenshots available
                       </div>
                    )}
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
                className="w-full max-w-6xl max-h-[85vh] flex flex-col md:flex-row gap-6 md:gap-8 bg-transparent rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Main Image Area */}
                <div className="flex-1 relative bg-muted rounded-[24px] corner-squircle overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex items-center justify-center max-h-[85vh]">
                   <div className="relative max-w-full max-h-[85vh] scale-110 -translate-y-[2%]">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                        src={selectedImage} 
                        alt="Full size view"
                        className="max-w-full max-h-[85vh] h-auto w-auto object-contain"
                     />
                   </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-[320px] flex-none flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wide">
                          #{selectedCompetitorIndex !== null ? selectedCompetitorIndex + 1 : ""} Threat
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-heading font-bold text-primary leading-tight">
                          {activeCompetitor.name}
                        </h2>
                        <a href={activeCompetitor.website} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-muted-foreground hover:text-primary hover:underline block mt-1 truncate">
                          {formatUrl(activeCompetitor.website)}
                        </a>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-[24px] corner-squircle border border-border/50">
                        <span className="text-[10px] font-mono font-bold text-primary uppercase mb-2 block">
                          AI Analysis
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activeCompetitor.reason}
                        </p>
                      </div>
                   </div>

                   <div className="space-y-3">
                     <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                        Other Views
                     </span>
                      <div className="flex flex-col gap-3">
                       {activeCompetitor.screenshots?.map((img, idx) => (
                         <button
                           key={idx}
                           onClick={() => setSelectedImage(img.imageUrl)}
                           className="group relative w-full aspect-[16/9] rounded-[24px] corner-squircle transition-all overflow-hidden"
                         >
                            <div className="absolute inset-0 rounded-[24px] corner-squircle overflow-hidden bg-muted z-0 scale-110 -translate-y-[5%]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={img.imageUrl} 
                                alt="Thumbnail"
                                className="w-full h-full object-cover object-[center_10%]"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              
                              <div className="absolute bottom-2 right-2">
                                <span className="font-mono text-[9px] bg-background/90 text-foreground px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">
                                  {getPathLabel(img.url, activeCompetitor.website)}
                                </span>
                              </div>
                            </div>
                            {/* Selection/hover outline above, never clipped */}
                            <span className={cn(
                              "pointer-events-none absolute inset-0 rounded-[24px] corner-squircle border-2 transition-opacity",
                              selectedImage === img.imageUrl ? "opacity-100 border-primary" : "opacity-0 group-hover:opacity-100 border-primary/20"
                            )}></span>
                         </button>
                       ))}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

