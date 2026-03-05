'use client';

import { useState } from 'react';
import ListingForm, { ListingFormData } from '@/components/ListingForm';
import ListingResult, { GeneratedListing } from '@/components/ListingResult';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedListing | null>(null);
  const [lastFormData, setLastFormData] = useState<ListingFormData | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  const handleGenerate = async (data: ListingFormData) => {
    setIsLoading(true);
    setResult(null);
    setLastFormData(data);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate listing');
      }

      const generatedListing = await response.json();
      setResult(generatedListing);

      // Scroll to results on mobile after a short delay
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error(error);
      alert('Error generating listing. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (section: 'title' | 'bullets' | 'description' | 'backend') => {
    if (!lastFormData || !result) return;
    setIsRegenerating(section);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lastFormData, regenerateSection: section, currentListing: result }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }

      const updatedSection = await response.json();
      setResult(prev => prev ? { ...prev, ...updatedSection } : null);
    } catch (error) {
      console.error(error);
      alert(`Error regenerating ${section}. Please check the console.`);
    } finally {
      setIsRegenerating(null);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-purple-500/30 text-purple-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Amazon Listing Optimization
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-sky-400">
            Generate High-Converting Listings
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light">
            Paste your Helium 10 keyword data, and our algorithm will cluster, analyze, and craft a fully SEO-optimized Amazon listing in seconds.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
          <div className="w-full xl:w-5/12 flex-shrink-0 relative z-10 transition-all duration-500">
            <ListingForm onSubmit={handleGenerate} isLoading={isLoading} />
          </div>

          {result ? (
            <div className="w-full xl:flex-1 relative z-10">
              <ListingResult
                result={result}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
              />
            </div>
          ) : (
            <div className="hidden xl:flex flex-col items-center justify-center min-h-[500px] w-full xl:flex-1 glass-card rounded-2xl p-12 text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 ring-1 ring-purple-500/20">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Generate</h3>
              <p className="text-gray-400 max-w-md">
                Fill in the product details and keyword data on the left, then click generate to see your expertly crafted SEO listing.
              </p>
              <div className="mt-8 flex items-center gap-4 text-purple-300/60 animate-pulse">
                <span>Awaiting Input</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
