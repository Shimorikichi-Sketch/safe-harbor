import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Link, Image, File, Send, Upload, X } from "lucide-react";
import type { ContentType } from "@/types/rely";
import { toast } from "sonner";

interface ContentInputProps {
  onSubmit: (content: string, type: ContentType, file?: File) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholders: Record<ContentType, string> = {
    text: "Paste any text, claim, or message you want to evaluate for reliance safety...",
    url: "Enter a URL to analyze the content at that address...",
    image: "Paste an image URL or upload an image file...",
    document: "Upload a document or paste text content...",
  };

  const handleSubmit = () => {
    if (content.trim() || selectedFile) {
      onSubmit(content.trim() || (selectedFile?.name || ''), activeType, selectedFile || undefined);
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", { description: "Maximum file size is 10MB" });
        return;
      }
      setSelectedFile(file);
      
      // For text-based files, read content
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setContent(event.target?.result as string || '');
        };
        reader.readAsText(file);
      } else {
        setContent(`[Uploaded file: ${file.name}]`);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", { description: "Maximum file size is 10MB" });
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setContent(event.target?.result as string || '');
        };
        reader.readAsText(file);
      } else {
        setContent(`[Uploaded file: ${file.name}]`);
      }
      
      // Auto-select appropriate type
      if (file.type.startsWith('image/')) {
        setActiveType('image');
      } else {
        setActiveType('document');
      }
    }
  }, []);

  const clearFile = () => {
    setSelectedFile(null);
    setContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Content Type Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
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

        {/* File Upload Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="text/*,image/*,.pdf,.doc,.docx,.txt,.md,.json,.csv"
          onChange={handleFileSelect}
        />
      </div>

      {/* Selected File Indicator */}
      {selectedFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <File className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground flex-1 truncate">
            {selectedFile.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
          <button 
            onClick={clearFile}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div 
        className="relative"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
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
          disabled={(!content.trim() && !selectedFile) || isAnalyzing}
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

      {/* Drop Zone Hint */}
      <p className="text-xs text-muted-foreground text-center">
        Drop files here or click Upload to attach documents
      </p>
    </div>
  );
}
