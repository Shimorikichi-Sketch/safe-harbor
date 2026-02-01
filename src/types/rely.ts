export type SignalType = 'safe' | 'unclear' | 'caution';

export interface RelianceAnalysis {
  signal: SignalType;
  signalLabel: string;
  reasoning: ReasoningPoint[];
  safeActions: string[];
  avoidActions: string[];
  delayReducesRisk: boolean;
  uncertaintyDisclosure: string;
}

export interface ReasoningPoint {
  category: 'coherence' | 'constraints' | 'continuity' | 'context-density' | 'uncertainty';
  text: string;
}

export type ContentType = 'text' | 'url' | 'image' | 'document';
