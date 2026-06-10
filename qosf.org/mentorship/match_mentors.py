#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Distributed under terms of the CC0 license.

"""Mentor-mentee matching for the QOSF mentorship program.

Reads a CSV of applicants exported from the application-form spreadsheet,
scores every mentee-mentor pair on an explainable set of factors, and writes
ranked match *suggestions* for organizers to review. It never auto-assigns:
the output is advisory, mirroring the real process where mentors choose their
mentees and organizers handle conflicts of interest and equity.

Expected CSV columns (header row, case-insensitive):

    role        "mentee" or "mentor"
    name        applicant name
    email       applicant email
    timezone    UTC offset as a number, e.g. -5, 0, 5.5
    level       numeric seniority, 1 (high school) .. 6 (faculty/lead)
    interests   comma-separated interest tags, e.g. "algorithms,qml"
    availability hours per week (number)
    capacity    mentors only: how many mentees they can take (number)

Usage:

    python match_mentors.py applicants.csv
    python match_mentors.py applicants.csv --top 5 --out matches.csv
    python match_mentors.py applicants.csv --json matches.json
"""

import argparse
import csv
import json
import sys

# Relative importance of each factor. Must sum to 1.0.
WEIGHTS = {
    "interests": 0.40,
    "timezone": 0.30,
    "level": 0.20,
    "availability": 0.10,
}

MAX_TZ_DISTANCE = 12.0  # hours; beyond this, timezone score is 0


def _to_float(value, default=0.0):
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return default


def _parse_interests(value):
    """Return a set of normalized interest tags from a delimited string."""
    if not value:
        return set()
    raw = str(value).replace(";", ",").replace("|", ",")
    return {tag.strip().lower() for tag in raw.split(",") if tag.strip()}


def load_applicants(path):
    """Read the CSV and split rows into mentees and mentors."""
    mentees, mentors = [], []
    with open(path, newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError("CSV file is empty or has no header row.")
        # Normalize header names to lower case for forgiving lookups.
        lower = {name: name.lower().strip() for name in reader.fieldnames}
        for row in reader:
            record = {lower[k]: v for k, v in row.items() if k is not None}
            person = {
                "name": (record.get("name") or "").strip(),
                "email": (record.get("email") or "").strip(),
                "timezone": _to_float(record.get("timezone")),
                "level": _to_float(record.get("level"), 1.0),
                "interests": _parse_interests(record.get("interests")),
                "availability": _to_float(record.get("availability")),
                "capacity": int(_to_float(record.get("capacity"), 1.0)) or 1,
            }
            role = (record.get("role") or "").strip().lower()
            if role == "mentor":
                mentors.append(person)
            elif role == "mentee":
                mentees.append(person)
    return mentees, mentors


def timezone_score(mentee, mentor):
    distance = abs(mentee["timezone"] - mentor["timezone"])
    return max(0.0, 1.0 - distance / MAX_TZ_DISTANCE)


def interest_score(mentee, mentor):
    """Jaccard similarity of interest tag sets."""
    a, b = mentee["interests"], mentor["interests"]
    if not a or not b:
        return 0.0
    union = a | b
    return len(a & b) / len(union) if union else 0.0


def level_score(mentee, mentor):
    """Reward a mentor at or modestly above the mentee's level."""
    gap = mentor["level"] - mentee["level"]
    if gap < 0:
        return 0.2          # mentor less senior than mentee: weak fit
    if gap <= 2:
        return 1.0          # ideal: same level up to two steps above
    return 0.6              # very large gap: still fine, slightly less ideal


def availability_score(mentee, mentor):
    """Both parties should have a workable amount of time."""
    if mentee["availability"] <= 0 or mentor["availability"] <= 0:
        return 0.0
    lo = min(mentee["availability"], mentor["availability"])
    return min(1.0, lo / 6.0)  # 6+ shared hours/week scores full marks


def score_pair(mentee, mentor):
    """Return (overall_percentage, component_breakdown)."""
    components = {
        "interests": interest_score(mentee, mentor),
        "timezone": timezone_score(mentee, mentor),
        "level": level_score(mentee, mentor),
        "availability": availability_score(mentee, mentor),
    }
    overall = sum(WEIGHTS[k] * v for k, v in components.items())
    return round(overall * 100, 1), components


def explain(mentee, mentor, components):
    shared = sorted(mentee["interests"] & mentor["interests"])
    tz = abs(mentee["timezone"] - mentor["timezone"])
    bits = []
    bits.append("shared interests: " + (", ".join(shared) if shared else "none"))
    bits.append("timezone gap: {:g}h".format(tz))
    bits.append("level fit: {:.0f}%".format(components["level"] * 100))
    return "; ".join(bits)


def rank_matches(mentees, mentors, top=3):
    """For each mentee, return the top-N mentor suggestions."""
    results = []
    for mentee in mentees:
        scored = []
        for mentor in mentors:
            overall, components = score_pair(mentee, mentor)
            scored.append({
                "mentor": mentor["name"],
                "mentor_email": mentor["email"],
                "score": overall,
                "reason": explain(mentee, mentor, components),
            })
        scored.sort(key=lambda m: m["score"], reverse=True)
        results.append({
            "mentee": mentee["name"],
            "mentee_email": mentee["email"],
            "suggestions": scored[:top],
        })
    return results


def write_csv(results, path):
    with open(path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["mentee", "mentee_email", "rank", "mentor",
                         "mentor_email", "score", "reason"])
        for entry in results:
            for rank, suggestion in enumerate(entry["suggestions"], start=1):
                writer.writerow([
                    entry["mentee"], entry["mentee_email"], rank,
                    suggestion["mentor"], suggestion["mentor_email"],
                    suggestion["score"], suggestion["reason"],
                ])


def print_report(results):
    for entry in results:
        print("\n" + "=" * 60)
        print("Mentee: {} <{}>".format(entry["mentee"], entry["mentee_email"]))
        if not entry["suggestions"]:
            print("  (no mentors available)")
            continue
        for rank, suggestion in enumerate(entry["suggestions"], start=1):
            print("  {}. {:>5}%  {}".format(
                rank, suggestion["score"], suggestion["mentor"]))
            print("        {}".format(suggestion["reason"]))


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Rank mentor suggestions for each mentee.")
    parser.add_argument("csv", help="applicants CSV exported from the form sheet")
    parser.add_argument("--top", type=int, default=3,
                        help="number of mentor suggestions per mentee (default 3)")
    parser.add_argument("--out", help="write ranked suggestions to this CSV")
    parser.add_argument("--json", dest="json_out",
                        help="write ranked suggestions to this JSON file")
    args = parser.parse_args(argv)

    mentees, mentors = load_applicants(args.csv)
    if not mentees:
        print("No mentees found in input.", file=sys.stderr)
        return 1
    if not mentors:
        print("No mentors found in input.", file=sys.stderr)
        return 1

    print("Loaded {} mentees and {} mentors.".format(len(mentees), len(mentors)))
    results = rank_matches(mentees, mentors, top=args.top)
    print_report(results)

    if args.out:
        write_csv(results, args.out)
        print("\nWrote CSV suggestions to {}".format(args.out))
    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as handle:
            json.dump(results, handle, indent=2)
        print("Wrote JSON suggestions to {}".format(args.json_out))

    return 0


if __name__ == "__main__":
    sys.exit(main())
