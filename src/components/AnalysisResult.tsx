import { SignalBadge } from "./SignalBadge";
import type { RelianceAnalysis } from "@/types/rely";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, HelpCircle } from "lucide-react";

interface AnalysisResultProps {
  analysis: RelianceAnalysis;
}

const categoryLabels: Record<string, string> = {
  'coherence': 'Coherence',
  'constraints': 'Constraints',
  'continuity': 'Continuity',
  'context-density': 'Context Density',
  'uncertainty': 'Uncertainty',
};

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Primary Signal */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <SignalBadge 
          signal={analysis.signal} 
          label={analysis.signalLabel} 
          size="lg" 
          animated 
        />
        <p className="text-muted-foreground text-sm font-mono text-center max-w-md">
          Based on invariant analysis of content properties
        </p>
      </div>

      {/* Reasoning */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            Why This Signal
          </h3>
        </div>
        <div className="p-5 space-y-3">
          {analysis.reasoning.map((point, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded bg-muted text-muted-foreground shrink-0 mt-0.5">
                {categoryLabels[point.category]}
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Action Guidance */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* What you CAN do */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-signal-safe-bg/50">
            <h3 className="font-semibold text-signal-safe flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Safe Actions
            </h3>
          </div>
          <ul className="p-5 space-y-2">
            {analysis.safeActions.map((action, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-sm text-foreground/90"
              >
                <span className="text-signal-safe mt-1">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* What to AVOID */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-signal-caution-bg/50">
            <h3 className="font-semibold text-signal-caution flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Avoid
            </h3>
          </div>
          <ul className="p-5 space-y-2">
            {analysis.avoidActions.map((action, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-sm text-foreground/90"
              >
                <span className="text-signal-caution mt-1">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delay Note */}
      {analysis.delayReducesRisk && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-signal-unclear-bg/50 border border-signal-unclear/20">
          <Clock className="w-5 h-5 text-signal-unclear shrink-0" />
          <p className="text-sm text-foreground/90">
            <span className="font-medium text-signal-unclear">Delaying action may reduce risk.</span>{" "}
            Additional time allows for verification and reduces pressure-based decisions.
          </p>
        </div>
      )}

      {/* Uncertainty Disclosure */}
      <div className="p-5 rounded-xl bg-muted/50 border border-border/30">
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Uncertainty Disclosure
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed italic">
          "{analysis.uncertaintyDisclosure}"
        </p>
      </div>
    </div>
  );
}
