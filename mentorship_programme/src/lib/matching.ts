import type { Profile } from "./types";

export interface MatchSuggestion {
  mentor: Profile;
  mentee: Profile;
  score: number;
  reasons: string[];
}

/**
 * Scoring weights — tweak these to adjust how matches are prioritised.
 * Normalised so that max raw score = 100 (before multiplying by 100).
 */
const WEIGHTS = {
  interestOverlap: 0.50,   // up to 50% of final score
  timezoneProximity: 0.35, // up to 35%
  educationMatch: 0.15,    // up to 15%
};

const TOTAL_WEIGHT = WEIGHTS.interestOverlap + WEIGHTS.timezoneProximity + WEIGHTS.educationMatch;

/**
 * Generate ranked mentor→mentee suggestions.
 *
 * The scoring logic lives entirely in this file so it can be modified
 * without touching any component.
 *
 * @param mentors  Approved mentor profiles
 * @param mentees  Approved mentee profiles
 * @returns        Descending-score list of suggested pairs (score 0–100)
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
  let raw = 0; // runs 0–TOTAL_WEIGHT

  // 1. Research-interest overlap
  const shared = intersection(
    mentor.research_interests ?? [],
    mentee.research_interests ?? [],
  );
  if (shared.length > 0) {
    const maxLen = Math.max(
      mentor.research_interests?.length ?? 1,
      mentee.research_interests?.length ?? 1,
      1,
    );
    raw += (shared.length / maxLen) * WEIGHTS.interestOverlap;
    reasons.push(`Shared interests: ${shared.join(", ")}`);
  }

  // 2. Timezone proximity (UTC offset within 3 hours)
  const tzScore = timezoneProximity(mentor.timezone, mentee.timezone);
  if (tzScore > 0) {
    raw += tzScore * WEIGHTS.timezoneProximity;
    reasons.push("Compatible timezone");
  }

  // 3. Academic degree match
  if (
    mentor.academic_degree &&
    mentee.academic_degree &&
    mentor.academic_degree.toLowerCase() ===
      mentee.academic_degree.toLowerCase()
  ) {
    raw += WEIGHTS.educationMatch;
    reasons.push("Similar academic degree");
  }

  // Normalise to 0–100
  const score = TOTAL_WEIGHT > 0 ? Math.round((raw / TOTAL_WEIGHT) * 100) : 0;

  return { mentor, mentee, score, reasons };
}

function intersection(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((x) => x.toLowerCase().trim()));
  return a.filter((x) => setB.has(x.toLowerCase().trim()));
}

/**
 * Parse a UTC-offset string like "UTC+05:30" or "UTC-04:00" into hours.
 * Returns null if unparseable.
 */
function parseUtcOffset(tz: string | undefined | null): number | null {
  if (!tz) return null;
  const m = tz.match(/^UTC([+-])(\d{2}):(\d{2})$/);
  if (!m) return null;
  const sign = m[1] === "+" ? 1 : -1;
  const hours = parseInt(m[2], 10);
  const minutes = parseInt(m[3], 10);
  return sign * (hours + minutes / 60);
}

/**
 * Score timezone compatibility (0 = none, 1 = same offset).
 * Two timezones within 3 hours get a proportional score.
 */
function timezoneProximity(
  a: string | undefined | null,
  b: string | undefined | null,
): number {
  const hA = parseUtcOffset(a);
  const hB = parseUtcOffset(b);
  if (hA === null || hB === null) return 0;

  const diff = Math.abs(hA - hB);
  if (diff <= 1) return 1.0;       // same offset
  if (diff <= 3) return 0.6;       // within 3 hours
  return 0;                         // too far apart
}
