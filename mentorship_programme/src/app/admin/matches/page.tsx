"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStatusColor } from "@/lib/utils";
import type { Profile, Cohort, Match } from "@/lib/types";
import { GitCompare, Check, X } from "lucide-react";

export default function AdminMatchesPage() {
  const supabase = createClient();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [mentees, setMentees] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>("");
  const [selectedMentee, setSelectedMentee] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: c } = await supabase.from("cohorts").select("*").order("created_at", { ascending: false });
      setCohorts(c ?? []);
      if (c && c.length > 0) setSelectedCohort(c[0].id);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCohort) return;
    async function loadProfiles() {
      const { data: m1 } = await supabase.from("profiles").select("*").eq("role", "mentor").eq("status", "approved");
      const { data: m2 } = await supabase.from("profiles").select("*").eq("role", "mentee").eq("status", "approved");
      setMentors(m1 ?? []);
      setMentees(m2 ?? []);

      const { data: m } = await supabase
        .from("matches")
        .select("*, mentor:profiles!matches_mentor_id_fkey(*), mentee:profiles!matches_mentee_id_fkey(*)")
        .eq("cohort_id", selectedCohort);
      setMatches(m ?? []);
    }
    loadProfiles();
  }, [selectedCohort]);

  async function createMatch() {
    if (!selectedMentor || !selectedMentee || !selectedCohort) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("matches").insert({
      cohort_id: selectedCohort,
      mentor_id: selectedMentor,
      mentee_id: selectedMentee,
      status: "pending",
      created_by: user?.id,
    });
    setSelectedMentor("");
    setSelectedMentee("");
    // Reload matches
    const { data: m } = await supabase
      .from("matches")
      .select("*, mentor:profiles!matches_mentor_id_fkey(*), mentee:profiles!matches_mentee_id_fkey(*)")
      .eq("cohort_id", selectedCohort);
    setMatches(m ?? []);
  }

  async function updateMatchStatus(matchId: string, status: string) {
    await supabase.from("matches").update({ status }).eq("id", matchId);
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status } : m)),
    );
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">Matches</h1>

      {/* Cohort selector */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-qosf-text mb-2">
          Select Cohort
        </label>
        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-qosf-border rounded-lg"
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Create match */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold text-qosf-blue mb-4 flex items-center gap-2">
          <GitCompare size={20} /> Create Match
        </h2>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-qosf-text mb-1">Mentor</label>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            >
              <option value="">Select mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name} — {m.research_interests?.join(", ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-qosf-text mb-1">Mentee</label>
            <select
              value={selectedMentee}
              onChange={(e) => setSelectedMentee(e.target.value)}
              className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            >
              <option value="">Select mentee</option>
              {mentees.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name} — {m.research_interests?.join(", ")}</option>
              ))}
            </select>
          </div>
          <button
            onClick={createMatch}
            disabled={!selectedMentor || !selectedMentee}
            className="btn-secondary justify-center disabled:opacity-50"
          >
            Create Match
          </button>
        </div>
      </div>

      {/* Current matches */}
      <h2 className="text-lg font-bold text-qosf-blue mb-4">Current Matches</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
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
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-qosf-text-light">
                  No matches yet for this cohort.
                </td>
              </tr>
            )}
            {matches.map((match: any) => (
              <tr key={match.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{match.mentor?.full_name ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{match.mentee?.full_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMatchStatus(match.id, "accepted")}
                      className="text-green-600 hover:text-green-800"
                      title="Accept"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => updateMatchStatus(match.id, "rejected")}
                      className="text-red-600 hover:text-red-800"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}