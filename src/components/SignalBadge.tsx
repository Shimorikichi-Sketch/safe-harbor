import { cn } from "@/lib/utils";
import type { SignalType } from "@/types/rely";
import { Shield, AlertTriangle, AlertOctagon } from "lucide-react";

interface SignalBadgeProps {
  signal: SignalType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const signalConfig = {
  safe: {
    icon: Shield,
    bgClass: "bg-signal-safe-bg",
    textClass: "text-signal-safe",
    borderClass: "border-signal-safe/30",
    glowClass: "signal-glow-safe",
  },
  unclear: {
    icon: AlertTriangle,
    bgClass: "bg-signal-unclear-bg",
    textClass: "text-signal-unclear",
    borderClass: "border-signal-unclear/30",
    glowClass: "signal-glow-unclear",
  },
  caution: {
    icon: AlertOctagon,
    bgClass: "bg-signal-caution-bg",
    textClass: "text-signal-caution",
    borderClass: "border-signal-caution/30",
    glowClass: "signal-glow-caution",
  },
};

const sizeConfig = {
  sm: {
    container: "px-3 py-1.5 gap-1.5",
    icon: "w-3.5 h-3.5",
    text: "text-xs",
  },
  md: {
    container: "px-4 py-2 gap-2",
    icon: "w-4 h-4",
    text: "text-sm",
  },
  lg: {
    container: "px-6 py-3 gap-3",
    icon: "w-5 h-5",
    text: "text-base",
  },
};

export function SignalBadge({ signal, label, size = 'md', animated = false }: SignalBadgeProps) {
  const config = signalConfig[signal];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-mono uppercase tracking-wider transition-all duration-300",
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizes.container,
        sizes.text,
        animated && config.glowClass,
        animated && "animate-scale-in"
      )}
    >
      <Icon className={cn(sizes.icon, animated && "animate-pulse-soft")} />
      <span className="font-semibold">{label}</span>
    </div>
  );
}
