import { useState, useEffect } from "react";
import { SignalBadge } from "./SignalBadge";
import { cn } from "@/lib/utils";
import { History, ChevronRight, Clock, FileText } from "lucide-react";
import { getAnalysisHistory } from "@/lib/analyzeService";
import type { RelianceAnalysis, ContentType, SignalType } from "@/types/rely";
import { formatDistanceToNow } from "date-fns";

interface HistoryItem {
  id: string;
  content: string;
  content_type: ContentType;
  signal: SignalType;
  signal_label: string;
  reasoning: RelianceAnalysis['reasoning'];
  safe_actions: string[];
  avoid_actions: string[];
  delay_reduces_risk: boolean;
  uncertainty_disclosure: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: RelianceAnalysis) => void;
}

export function AnalysisHistory({ onSelectAnalysis }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getAnalysisHistory();
    setHistory(data);
    setIsLoading(false);
  };

  const handleSelect = (item: HistoryItem) => {
    const analysis: RelianceAnalysis = {
      signal: item.signal,
      signalLabel: item.signal_label,
      reasoning: item.reasoning,
      safeActions: item.safe_actions,
      avoidActions: item.avoid_actions,
      delayReducesRisk: item.delay_reduces_risk,
      uncertaintyDisclosure: item.uncertainty_disclosure,
    };
    onSelectAnalysis(analysis);
    setIsOpen(false);
  };

  const truncateContent = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (history.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 w-full",
          isOpen 
            ? "bg-card border border-border/50 text-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <History className="w-4 h-4" />
        <span>Analysis History</span>
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
          {history.length}
        </span>
        <ChevronRight className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-90"
        )} />
      </button>

      {/* History List */}
      {isOpen && (
        <div className="mt-2 bg-card border border-border/50 rounded-xl overflow-hidden animate-fade-in">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {history.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                    index !== history.length - 1 && "border-b border-border/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <SignalBadge signal={item.signal} label="" size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.file_name && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <FileText className="w-3 h-3" />
                            {item.file_name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.content_type}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 font-mono line-clamp-2">
                        {truncateContent(item.content)}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
