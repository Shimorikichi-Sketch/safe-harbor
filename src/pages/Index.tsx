import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ContentInput } from "@/components/ContentInput";
import { AnalysisResult } from "@/components/AnalysisResult";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { analyzeContentAI, uploadFile } from "@/lib/analyzeService";
import type { RelianceAnalysis, ContentType } from "@/types/rely";
import { Shield, Zap, Eye, Lock } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [analysis, setAnalysis] = useState<RelianceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleSubmit = async (content: string, type: ContentType, file?: File) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      
      // Handle file upload
      if (file) {
        toast.info("Uploading file...");
        const uploaded = await uploadFile(file);
        fileUrl = uploaded.url;
        fileName = uploaded.name;
        toast.success("File uploaded successfully");
      }

      toast.info("Analyzing content with AI...");
      const result = await analyzeContentAI(content, type, fileUrl, fileName);
      setAnalysis(result);
      setHistoryKey(prev => prev + 1); // Refresh history
      toast.success("Analysis complete");
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error("Analysis failed", { 
        description: error instanceof Error ? error.message : "Please try again" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
  };

  const handleSelectFromHistory = (selectedAnalysis: RelianceAnalysis) => {
    setAnalysis(selectedAnalysis);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header />

        {/* Intro Section */}
        {!analysis && !isAnalyzing && (
          <div className="mt-8 mb-8 text-center animate-fade-in">
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Evaluate whether content is safe to rely on for decision-making.
              <span className="block mt-2 text-sm text-muted-foreground/70">
                Not "real or fake" — but "safe to act on given uncertainty."
              </span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { icon: Eye, label: 'AI Analysis' },
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
        <main className="mt-8 space-y-6">
          {!analysis ? (
            <>
              <ContentInput onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
              <AnalysisHistory 
                key={historyKey}
                onSelectAnalysis={handleSelectFromHistory} 
              />
            </>
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
              Powered by AI • Operates on invariant properties, not stylistic cues.
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
