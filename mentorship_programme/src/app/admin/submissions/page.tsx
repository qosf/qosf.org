"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getStatusColor } from "@/lib/utils";
import { Check, X, RotateCcw, Trophy, ExternalLink } from "lucide-react";

export default function AdminSubmissionsPage() {
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*, profile:profiles!submissions_user_id_fkey(id, full_name, email), cohort:cohorts!submissions_cohort_id_fkey(id, name)")
        .order("created_at", { ascending: false });
      setSubmissions(data ?? []);
    })();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("submissions")
      .update({ status, is_winner: status === "winner", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { alert("Failed: " + error.message); return; }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, is_winner: status === "winner" } : s)),
    );
  }

  async function toggleWinner(id: string, current: boolean) {
    const { error } = await supabase
      .from("submissions")
      .update({ is_winner: !current, status: !current ? "winner" : "submitted", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { alert("Failed: " + error.message); return; }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, is_winner: !current, status: !current ? "winner" : "submitted" } : s,
      ),
    );
  }

  const filtered = filter === "all"
    ? submissions
    : submissions.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-qosf-blue">Submissions</h1>
        <div className="flex gap-2">
          {["all", "draft", "submitted", "banned", "winner"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-qosf-blue text-white"
                  : "bg-gray-100 text-qosf-text-light hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-qosf-blue text-white text-left">
              <th className="px-4 py-3 font-medium text-sm">Project</th>
              <th className="px-4 py-3 font-medium text-sm">Author</th>
              <th className="px-4 py-3 font-medium text-sm">Cohort</th>
              <th className="px-4 py-3 font-medium text-sm">Status</th>
              <th className="px-4 py-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-qosf-text-light">No submissions match this filter.</td></tr>
            )}
            {filtered.map((sub: any) => (
              <tr key={sub.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/project/${sub.id}`}
                      className="font-medium text-sm text-qosf-blue hover:underline flex items-center gap-1"
                    >
                      {sub.project_name}
                      <ExternalLink size={12} />
                    </Link>
                    {sub.is_winner && (
                      <Trophy size={14} className="text-yellow-600" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/profile/${sub.profile?.id}`}
                    className="text-qosf-blue hover:underline"
                  >
                    {sub.profile?.full_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-qosf-text-light">
                  {sub.cohort?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {sub.status === "submitted" && (
                      <>
                        <button
                          onClick={() => updateStatus(sub.id, "banned")}
                          className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                          title="Ban"
                        >
                          <X size={14} /> Ban
                        </button>
                        <button
                          onClick={() => toggleWinner(sub.id, false)}
                          className="text-yellow-600 hover:text-yellow-800 text-xs flex items-center gap-1"
                          title="Mark as winner"
                        >
                          <Trophy size={14} /> Win
                        </button>
                      </>
                    )}
                    {(sub.status === "banned" || sub.status === "winner") && (
                      <button
                        onClick={() => updateStatus(sub.id, "submitted")}
                        className="text-qosf-text-light hover:text-qosf-blue text-xs flex items-center gap-1"
                        title="Reset to submitted"
                      >
                        <RotateCcw size={14} /> Reset
                      </button>
                    )}
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
