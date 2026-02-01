-- Create analysis history table
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  signal TEXT NOT NULL,
  signal_label TEXT NOT NULL,
  reasoning JSONB NOT NULL DEFAULT '[]'::jsonb,
  safe_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  avoid_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  delay_reduces_risk BOOLEAN NOT NULL DEFAULT false,
  uncertainty_disclosure TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and read (no auth required for this demo)
CREATE POLICY "Anyone can insert analysis" 
ON public.analysis_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view analysis history" 
ON public.analysis_history 
FOR SELECT 
USING (true);

-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Allow public uploads and reads
CREATE POLICY "Anyone can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Anyone can view uploaded files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');