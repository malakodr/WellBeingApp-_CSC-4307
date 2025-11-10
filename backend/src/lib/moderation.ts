/**
 * Content Moderation Utilities
 * Provides keyword-based content moderation for peer room messages
 */

export interface ModerationResult {
  flagged: boolean;
  flags: string[];
}

// Keywords that trigger flagging
const SELF_HARM_KEYWORDS = [
  'self-harm',
  'self harm',
  'cut myself',
  'cutting myself',
  'hurt myself',
  'hurting myself',
  'kill myself',
  'killing myself',
  'suicide',
  'suicidal',
  'end my life',
  'want to die',
  'better off dead',
  'no reason to live',
];

const PROFANITY_KEYWORDS = [
  'fuck',
  'shit',
  'bitch',
  'ass',
  'damn',
  'crap',
  'hell',
  'bastard',
];

const SUBSTANCE_KEYWORDS = [
  'getting high',
  'doing drugs',
  'buy drugs',
  'sell drugs',
  'overdose',
  'getting drunk',
];

const VIOLENCE_KEYWORDS = [
  'want to hurt',
  'going to hurt',
  'kill someone',
  'attack someone',
  'bring a weapon',
  'shoot up',
];

/**
 * Moderate content based on keyword detection
 * @param content - The message content to moderate
 * @param isMinorSafe - Whether the room requires stricter moderation
 * @returns ModerationResult with flagged status and reasons
 */
export function moderateContent(
  content: string,
  isMinorSafe: boolean = false
): ModerationResult {
  const lowerContent = content.toLowerCase();
  const flags: string[] = [];

  // Check for self-harm keywords (always flag)
  for (const keyword of SELF_HARM_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      flags.push('self-harm');
      break;
    }
  }

  // Check for violence keywords (always flag)
  for (const keyword of VIOLENCE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      flags.push('violence');
      break;
    }
  }

  // Check for substance keywords (always flag)
  for (const keyword of SUBSTANCE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      flags.push('substance');
      break;
    }
  }

  // Check for profanity (flag if minor-safe room)
  if (isMinorSafe) {
    for (const keyword of PROFANITY_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        flags.push('profanity');
        break;
      }
    }
  }

  // Remove duplicates and return
  const uniqueFlags = Array.from(new Set(flags));
  
  return {
    flagged: uniqueFlags.length > 0,
    flags: uniqueFlags,
  };
}

/**
 * Check if user can access a room based on age and room settings
 * @param userAgeBracket - User's age bracket
 * @param userConsentMinorOk - User's consent status
 * @param isMinorSafe - Room's minor-safe setting
 * @returns boolean indicating if access is allowed
 */
export function canAccessRoom(
  userAgeBracket: string | null,
  userConsentMinorOk: boolean,
  isMinorSafe: boolean
): { allowed: boolean; reason?: string } {
  // If room is not minor-safe and user is under 18
  if (!isMinorSafe && userAgeBracket === 'MINOR') {
    return {
      allowed: false,
      reason: 'This room is not available for users under 18.',
    };
  }

  // Check if minor has consent
  if (userAgeBracket === 'MINOR' && !userConsentMinorOk) {
    return {
      allowed: false,
      reason: 'Parental consent required for minors to access peer rooms.',
    };
  }

  return { allowed: true };
}
