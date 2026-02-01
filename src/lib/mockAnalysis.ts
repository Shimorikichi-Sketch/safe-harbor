import type { RelianceAnalysis, ContentType } from "@/types/rely";

// Simulates analysis based on content characteristics
export function analyzeContent(content: string, type: ContentType): RelianceAnalysis {
  const length = content.length;
  const hasUrls = /https?:\/\//.test(content);
  const hasUrgency = /urgent|immediately|now|act fast|limited time|expires/i.test(content);
  const hasAuthority = /official|government|bank|police|verified|confirmed/i.test(content);
  const hasMoneyTerms = /\$|money|payment|transfer|wire|bitcoin|crypto|account/i.test(content);
  const hasEmotional = /amazing|incredible|shocking|unbelievable|you won't believe/i.test(content);
  
  // Calculate risk factors
  let riskScore = 0;
  if (hasUrgency) riskScore += 2;
  if (hasAuthority) riskScore += 1;
  if (hasMoneyTerms) riskScore += 2;
  if (hasEmotional) riskScore += 1;
  if (length < 50) riskScore += 1; // Very short content lacks context
  
  // Determine signal
  let signal: 'safe' | 'unclear' | 'caution';
  let signalLabel: string;
  
  if (riskScore >= 4) {
    signal = 'caution';
    signalLabel = 'Use caution — high reliance risk';
  } else if (riskScore >= 2) {
    signal = 'unclear';
    signalLabel = 'Unclear — delay or verify';
  } else {
    signal = 'safe';
    signalLabel = 'Safe to rely on';
  }
  
  // Generate reasoning
  const reasoning: RelianceAnalysis['reasoning'] = [];
  
  if (hasUrgency) {
    reasoning.push({
      category: 'constraints',
      text: 'Content contains urgency markers that may pressure rapid decision-making without adequate verification.'
    });
  }
  
  if (hasAuthority) {
    reasoning.push({
      category: 'coherence',
      text: 'Claims of authority or official status cannot be independently verified from the content alone.'
    });
  }
  
  if (hasMoneyTerms) {
    reasoning.push({
      category: 'context-density',
      text: 'Financial implications are present, requiring higher verification standards before action.'
    });
  }
  
  if (length < 50) {
    reasoning.push({
      category: 'context-density',
      text: 'Insufficient context provided to establish a reliable basis for action.'
    });
  }
  
  if (reasoning.length === 0) {
    reasoning.push({
      category: 'coherence',
      text: 'Content appears internally consistent without obvious contradictions.'
    });
    reasoning.push({
      category: 'constraints',
      text: 'No violations of known logical or practical constraints detected.'
    });
  }
  
  reasoning.push({
    category: 'uncertainty',
    text: 'Origin and creation context of this content cannot be determined from analysis alone.'
  });
  
  // Generate actions
  const safeActions = signal === 'caution' 
    ? [
        'Cross-reference claims through independent sources',
        'Verify identity of sender through known channels',
        'Consult with trusted parties before proceeding'
      ]
    : signal === 'unclear'
    ? [
        'Use as preliminary information only',
        'Seek additional verification before major decisions',
        'Consider the content as one data point among many'
      ]
    : [
        'Proceed with normal caution',
        'Use information for intended purpose',
        'Make decisions within your risk tolerance'
      ];
  
  const avoidActions = signal === 'caution'
    ? [
        'Making immediate financial commitments',
        'Sharing sensitive personal information',
        'Acting under time pressure without verification'
      ]
    : signal === 'unclear'
    ? [
        'Treating information as fully verified',
        'Making irreversible decisions based solely on this',
        'Forwarding without noting uncertainty'
      ]
    : [
        'Over-relying without context awareness',
        'Ignoring future contradictory information'
      ];
  
  return {
    signal,
    signalLabel,
    reasoning,
    safeActions,
    avoidActions,
    delayReducesRisk: hasUrgency || riskScore >= 3,
    uncertaintyDisclosure: hasMoneyTerms || hasAuthority
      ? 'The authenticity of authority claims and financial context cannot be verified. These elements require external validation before reliance.'
      : length < 100
      ? 'Limited content length reduces analytical confidence. More context would enable better assessment.'
      : 'Standard analytical limitations apply. No system can determine absolute truth from content alone.'
  };
}
