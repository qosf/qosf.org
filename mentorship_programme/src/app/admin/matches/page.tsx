"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStatusColor } from "@/lib/utils";
import { suggestMatches, type MatchSuggestion } from "@/lib/matching";
import type { Profile, Cohort } from "@/lib/types";
import { GitCompare, Check, X, Trash2, Lightbulb, Plus } from "lucide-react";
import ProfileModal from "@/components/ProfileModal";

export default function AdminMatchesPage() {
  const supabase = createClient();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [mentees, setMentees] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentee, setSelectedMentee] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileModalTarget, setProfileModalTarget] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.from("cohorts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCohorts(data ?? []); if (data?.length) setSelectedCohort(data[0].id); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedCohort) return;
    (async () => {
      const [m1, m2, m] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "mentor").eq("status", "approved"),
        supabase.from("profiles").select("*").eq("role", "mentee").eq("status", "approved"),
        supabase.from("matches")
          .select("*, mentor:profiles!matches_mentor_id_fkey(*), mentee:profiles!matches_mentee_id_fkey(*)")
          .eq("cohort_id", selectedCohort),
      ]);
      const mentors = m1.data ?? [];
      const mentees = m2.data ?? [];
      setMentors(mentors);
      setMentees(mentees);
      setMatches(m.data ?? []);
      setSuggestions(suggestMatches(mentors, mentees));
    })();
  }, [selectedCohort]);

  // Mentor/mentee IDs already matched (to exclude from suggestions)
  const matchedIds = new Set<string>();
  for (const m of matches) {
    matchedIds.add(m.mentor_id);
    matchedIds.add(m.mentee_id);
  }

  // Filter out already-matched pairs entirely
  const filteredSuggestions = suggestions.filter(
    (s) => !matchedIds.has(s.mentor.id) && !matchedIds.has(s.mentee.id),
  );

  async function createMatch(mentorId: string, menteeId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("matches").insert({
      cohort_id: selectedCohort, mentor_id: mentorId, mentee_id: menteeId,
      status: "accepted", created_by: user?.id,
    });
    if (error) { alert("Failed to create match: " + error.message); return; }
    await reloadMatches();
    setSelectedMentor("");
    setSelectedMentee("");
  }

  async function reloadMatches() {
    const [m1, m2, m] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "mentor").eq("status", "approved"),
      supabase.from("profiles").select("*").eq("role", "mentee").eq("status", "approved"),
      supabase.from("matches")
        .select("*, mentor:profiles!matches_mentor_id_fkey(*), mentee:profiles!matches_mentee_id_fkey(*)")
        .eq("cohort_id", selectedCohort),
    ]);
    setMentors(m1.data ?? []);
    setMentees(m2.data ?? []);
    setMatches(m.data ?? []);
    setSuggestions(suggestMatches(m1.data ?? [], m2.data ?? []));
  }

  async function updateMatchStatus(matchId: string, status: string) {
    const { error } = await supabase.from("matches").update({ status }).eq("id", matchId);
    if (error) { alert("Failed to update: " + error.message); return; }
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status } : m)));
  }

  async function deleteMatch(matchId: string) {
    if (!confirm("Delete this match?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", matchId);
    if (error) {
      alert("Failed to delete: " + error.message);
      return;
    }
    await reloadMatches();
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">Matches</h1>

      {/* Cohort selector */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-qosf-text mb-2">Cohort</label>
        <select value={selectedCohort} onChange={(e) => setSelectedCohort(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-qosf-border rounded-lg">
          {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Suggested matches */}
      {filteredSuggestions.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-qosf-blue mb-4 flex items-center gap-2">
            <Lightbulb size={20} /> Suggested Matches
          </h2>
          <p className="text-sm text-qosf-text-light mb-4">
            Automatically ranked by interests, timezone, and education.
          </p>
          <div className="space-y-3">
            {filteredSuggestions.slice(0, 10).map((s) => (
              <div key={`${s.mentor.id}-${s.mentee.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-qosf-border rounded-lg">
                <div className="text-sm">
                  <button onClick={() => setProfileModalTarget(s.mentor)}
                    className="font-medium text-qosf-blue hover:underline text-left">
                    {s.mentor.full_name}
                  </button>
                  <span className="text-qosf-text-light mx-2">&times;</span>
                  <button onClick={() => setProfileModalTarget(s.mentee)}
                    className="font-medium text-qosf-blue hover:underline text-left">
                    {s.mentee.full_name}
                  </button>
                  <span className="ml-2 text-xs bg-qosf-accent/20 text-qosf-accent font-bold px-2 py-0.5 rounded">
                    {s.score}%
                  </span>
                  {s.reasons.length > 0 && (
                    <p className="text-xs text-qosf-text-light mt-1">{s.reasons.join(" · ")}</p>
                  )}
                </div>
                <button onClick={() => createMatch(s.mentor.id, s.mentee.id)}
                  className="btn-primary text-xs py-1 px-3 shrink-0">
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual match */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold text-qosf-blue mb-4 flex items-center gap-2">
          <Plus size={20} /> Manual Match
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-qosf-text mb-1">Mentor</label>
            <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)}
              className="w-full px-3 py-2 border border-qosf-border rounded-lg">
              <option value="">Select mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-qosf-text mb-1">Mentee</label>
            <select value={selectedMentee} onChange={(e) => setSelectedMentee(e.target.value)}
              className="w-full px-3 py-2 border border-qosf-border rounded-lg">
              <option value="">Select mentee</option>
              {mentees.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>
          <button onClick={() => createMatch(selectedMentor, selectedMentee)}
            disabled={!selectedMentor || !selectedMentee}
            className="btn-secondary justify-center disabled:opacity-50 whitespace-nowrap">
            <GitCompare size={16} /> Create Match
          </button>
        </div>
      </div>

      {/* Current matches */}
      <h2 className="text-lg font-bold text-qosf-blue mb-4">Current Matches</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-qosf-blue text-white text-left">
              <th className="px-4 py-3 font-medium text-sm">Mentor</th>
              <th className="px-4 py-3 font-medium text-sm">Mentee</th>
              <th className="px-4 py-3 font-medium text-sm">Status</th>
              <th className="px-4 py-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-qosf-text-light">No matches yet.</td></tr>
            )}
            {matches.map((match: any) => (
              <tr key={match.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button onClick={() => setProfileModalTarget(match.mentor)}
                    className="font-medium text-sm text-qosf-blue hover:underline text-left">
                    {match.mentor?.full_name ?? "—"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setProfileModalTarget(match.mentee)}
                    className="font-medium text-sm text-qosf-blue hover:underline text-left">
                    {match.mentee?.full_name ?? "—"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {match.status !== "accepted" && (
                      <button onClick={() => updateMatchStatus(match.id, "accepted")}
                        className="text-green-600 hover:text-green-800" title="Approve"><Check size={16} /></button>
                    )}
                    {match.status !== "rejected" && (
                      <button onClick={() => updateMatchStatus(match.id, "rejected")}
                        className="text-red-600 hover:text-red-800" title="Reject"><X size={16} /></button>
                    )}
                    <button onClick={() => deleteMatch(match.id)}
                      className="text-qosf-text-light hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {profileModalTarget && (
        <ProfileModal profile={profileModalTarget} onClose={() => setProfileModalTarget(null)} />
      )}
    </div>
  );
}
