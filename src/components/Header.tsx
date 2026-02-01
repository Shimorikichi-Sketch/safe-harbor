import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-6">
      <div className="flex items-center justify-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
            RELY
          </h1>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Reliance Safety Engine
          </p>
        </div>
      </div>
    </header>
  );
}
