import type { SignalType, RelianceAnalysis, ContentType, ReasoningPoint } from "@/types/rely";
import { supabase } from "@/integrations/supabase/client";

export async function analyzeContentAI(
  content: string, 
  contentType: ContentType,
  fileUrl?: string,
  fileName?: string
): Promise<RelianceAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze', {
    body: { content, contentType }
  });

  if (error) {
    throw new Error(error.message || 'Analysis failed');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  const analysis: RelianceAnalysis = {
    signal: data.signal as SignalType,
    signalLabel: data.signalLabel,
    reasoning: data.reasoning || [],
    safeActions: data.safeActions || [],
    avoidActions: data.avoidActions || [],
    delayReducesRisk: data.delayReducesRisk ?? false,
    uncertaintyDisclosure: data.uncertaintyDisclosure || 'Analysis uncertainty exists.',
  };

  // Save to history
  await saveToHistory(content, contentType, analysis, fileUrl, fileName);

  return analysis;
}

async function saveToHistory(
  content: string,
  contentType: ContentType,
  analysis: RelianceAnalysis,
  fileUrl?: string,
  fileName?: string
): Promise<void> {
  const { error } = await supabase.from('analysis_history').insert([{
    content: content.substring(0, 10000), // Limit stored content
    content_type: contentType,
    signal: analysis.signal,
    signal_label: analysis.signalLabel,
    reasoning: JSON.parse(JSON.stringify(analysis.reasoning)),
    safe_actions: JSON.parse(JSON.stringify(analysis.safeActions)),
    avoid_actions: JSON.parse(JSON.stringify(analysis.avoidActions)),
    delay_reduces_risk: analysis.delayReducesRisk,
    uncertainty_disclosure: analysis.uncertaintyDisclosure,
    file_url: fileUrl || null,
    file_name: fileName || null,
  }]);

  if (error) {
    console.error('Failed to save to history:', error);
  }
}

export async function getAnalysisHistory(): Promise<Array<{
  id: string;
  content: string;
  content_type: ContentType;
  signal: SignalType;
  signal_label: string;
  reasoning: ReasoningPoint[];
  safe_actions: string[];
  avoid_actions: string[];
  delay_reduces_risk: boolean;
  uncertainty_disclosure: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    content: item.content,
    content_type: item.content_type as ContentType,
    signal: item.signal as SignalType,
    signal_label: item.signal_label,
    reasoning: (item.reasoning as unknown as ReasoningPoint[]) || [],
    safe_actions: (item.safe_actions as unknown as string[]) || [],
    avoid_actions: (item.avoid_actions as unknown as string[]) || [],
    delay_reduces_risk: item.delay_reduces_risk,
    uncertainty_disclosure: item.uncertainty_disclosure,
    file_url: item.file_url,
    file_name: item.file_name,
    created_at: item.created_at,
  }));
}

export async function uploadFile(file: File): Promise<{ url: string; name: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return { url: publicUrl, name: file.name };
}
