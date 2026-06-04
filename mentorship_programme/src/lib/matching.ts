import type { Profile } from "./types";

export interface MatchSuggestion {
  mentor: Profile;
  mentee: Profile;
  score: number;
  reasons: string[];
}

/**
 * Scoring weights — tweak these to adjust how matches are prioritised.
 */
const WEIGHTS = {
  interestOverlap: 1.0,
  timezoneProximity: 0.6,
  educationMatch: 0.3,
};

/**
 * Generate ranked mentor→mentee suggestions.
 *
 * The scoring logic lives entirely in this file so it can be modified
 * without touching any component.
 *
 * @param mentors  Approved mentor profiles
 * @param mentees  Approved mentee profiles
 * @returns        Descending-score list of suggested pairs
 */
export function suggestMatches(
  mentors: Profile[],
  mentees: Profile[],
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];

  for (const mentor of mentors) {
    for (const mentee of mentees) {
      suggestions.push(scorePair(mentor, mentee));
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions;
}

// ── Scoring internals ───────────────────────────────────────────

function scorePair(mentor: Profile, mentee: Profile): MatchSuggestion {
  const reasons: string[] = [];
  let score = 0;

  // 1. Research-interest overlap
  const shared = intersection(
    mentor.research_interests ?? [],
    mentee.research_interests ?? [],
  );
  if (shared.length > 0) {
    const maxLen = Math.max(
      mentor.research_interests?.length ?? 1,
      1,
    );
    score += (shared.length / maxLen) * 100 * WEIGHTS.interestOverlap;
    reasons.push(`Shared interests: ${shared.join(", ")}`);
  }

  // 2. Timezone proximity (same half-of-the-world = compatible)
  if (
    mentor.timezone &&
    mentee.timezone &&
    timezoneRegion(mentor.timezone) === timezoneRegion(mentee.timezone)
  ) {
    score += 100 * WEIGHTS.timezoneProximity;
    reasons.push("Same timezone region");
  } else if (!mentor.timezone || !mentee.timezone) {
    // Can't compare — neutral
  }

  // 3. Education-level hint
  if (
    mentor.educational_level &&
    mentee.educational_level &&
    mentor.educational_level.toLowerCase() ===
      mentee.educational_level.toLowerCase()
  ) {
    score += 100 * WEIGHTS.educationMatch;
    reasons.push("Similar educational level");
  }

  return { mentor, mentee, score: Math.round(score), reasons };
}

function intersection(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((x) => x.toLowerCase().trim()));
  return a.filter((x) => setB.has(x.toLowerCase().trim()));
}

/** Coarse timezone region based on common IANA area prefixes. */
function timezoneRegion(tz: string): string | null {
  const parts = tz.split("/");
  return parts.length >= 2 ? parts[0].toLowerCase() : null;
}
