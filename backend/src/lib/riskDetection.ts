const RISK_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'self-harm',
  'self harm',
  'hurt myself',
  'die',
  'death',
  'worthless',
  'no point',
  'give up',
  'violence',
  'hurt',
  'kill',
];

export const detectRisk = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return RISK_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

export const determineRoute = (
  urgency: string,
  riskFlag: boolean,
  moodScore: number
): 'CRISIS' | 'BOOK' | 'PEER' => {
  if (riskFlag || urgency === 'crisis' || moodScore <= 3) {
    return 'CRISIS';
  }
  
  if (urgency === 'high' || moodScore <= 5) {
    return 'BOOK';
  }
  
  return 'PEER';
};
