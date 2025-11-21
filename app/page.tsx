import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20">
      <main className="flex flex-col gap-12 max-w-2xl w-full items-center text-center">
        
        <div className="space-y-6">
          <div className="flex justify-center">
             <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-[rgb(255,252,236)] font-mono text-[12px] font-bold uppercase tracking-wide">
               Competitor Analysis
             </span>
          </div>
          
          <h1 className="text-[40px] leading-[39px] font-heading font-bold text-primary">
            See what your rivals are up to.
          </h1>
          
          <p className="text-[17px] leading-[26px] font-sans font-medium text-[#696969] max-w-lg mx-auto">
            Enter your website to instantly uncover your competitors' strategies, landing pages, and blog structures.
          </p>
        </div>

        <form className="w-full max-w-md flex flex-col gap-4">
          <div className="flex flex-col text-left gap-2">
            <label htmlFor="website" className="text-[12px] font-mono font-bold text-[#696969] uppercase">
              Your Website URL
            </label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
            />
          </div>

          <Button
            type="submit"
            className="mt-2 w-full h-auto py-3 text-[17px] cursor-pointer"
          >
            Analyze Competitors
          </Button>
        </form>
        
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
