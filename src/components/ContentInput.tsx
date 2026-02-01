import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Link, Image, File, Send } from "lucide-react";
import type { ContentType } from "@/types/rely";

interface ContentInputProps {
  onSubmit: (content: string, type: ContentType) => void;
  isAnalyzing: boolean;
}

const contentTypes: { type: ContentType; icon: typeof FileText; label: string }[] = [
  { type: 'text', icon: FileText, label: 'Text' },
  { type: 'url', icon: Link, label: 'URL' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'document', icon: File, label: 'Document' },
];

export function ContentInput({ onSubmit, isAnalyzing }: ContentInputProps) {
  const [content, setContent] = useState("");
  const [activeType, setActiveType] = useState<ContentType>('text');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), activeType);
    }
  };

  const placeholders: Record<ContentType, string> = {
    text: "Paste any text, claim, or message you want to evaluate for reliance safety...",
    url: "Enter a URL to analyze the content at that address...",
    image: "Paste an image URL or describe the image content...",
    document: "Paste document text or describe the document contents...",
  };

  return (
    <div className="w-full space-y-4">
      {/* Content Type Selector */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {contentTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeType === type
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholders[activeType]}
          className={cn(
            "min-h-[160px] resize-none font-mono text-sm",
            "bg-card border-border/50 rounded-xl",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "transition-all duration-200",
            "placeholder:text-muted-foreground/60"
          )}
        />
        
        {/* Character count */}
        <div className="absolute bottom-3 left-3 text-xs text-muted-foreground font-mono">
          {content.length.toLocaleString()} chars
        </div>

        {/* Submit button */}
        <Button
          variant="analyze"
          size="lg"
          onClick={handleSubmit}
          disabled={!content.trim() || isAnalyzing}
          className="absolute bottom-3 right-3"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Evaluate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
