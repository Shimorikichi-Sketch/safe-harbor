import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ContentInput } from "@/components/ContentInput";
import { AnalysisResult } from "@/components/AnalysisResult";
import { analyzeContent } from "@/lib/mockAnalysis";
import type { RelianceAnalysis, ContentType } from "@/types/rely";
import { Shield, Zap, Eye, Lock } from "lucide-react";

const Index = () => {
  const [analysis, setAnalysis] = useState<RelianceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleSubmit = async (content: string, type: ContentType) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = analyzeContent(content, type);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header />

        {/* Intro Section */}
        {!analysis && !isAnalyzing && (
          <div className="mt-8 mb-12 text-center animate-fade-in">
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Evaluate whether content is safe to rely on for decision-making.
              <span className="block mt-2 text-sm text-muted-foreground/70">
                Not "real or fake" — but "safe to act on given uncertainty."
              </span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { icon: Eye, label: 'Invariant Analysis' },
                { icon: Shield, label: 'Decision Safety' },
                { icon: Zap, label: 'Action Guidance' },
                { icon: Lock, label: 'No Truth Claims' },
              ].map(({ icon: Icon, label }) => (
                <div 
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="mt-8 space-y-8">
          {!analysis ? (
            <ContentInput onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
          ) : (
            <>
              <AnalysisResult analysis={analysis} />
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleReset}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  ← Evaluate another
                </button>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-border/30">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground/70 font-mono">
              RELY operates on invariant properties, not stylistic cues.
            </p>
            <p className="text-xs text-muted-foreground/50">
              Truth is often unknowable. Reliance safety is not.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
