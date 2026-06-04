"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStatusColor } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { Check, X } from "lucide-react";
import ProfileModal from "@/components/ProfileModal";

export default function AdminMentorsPage() {
  const supabase = createClient();
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("role", "mentor").order("created_at", { ascending: false })
      .then(({ data }) => setMentors(data ?? []));
  }, []);

  async function updateStatus(pid: string, status: string) {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", pid);
    if (error) { alert("Failed to update: " + error.message); return; }
    setMentors((prev) => prev.map((m) => (m.id === pid ? { ...m, status: status as Profile["status"] } : m)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">Mentors</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-qosf-blue text-white text-left">
              <th className="px-4 py-3 font-medium text-sm">Name</th>
              <th className="px-4 py-3 font-medium text-sm">Email</th>
              <th className="px-4 py-3 font-medium text-sm">Timezone</th>
              <th className="px-4 py-3 font-medium text-sm">Interests</th>
              <th className="px-4 py-3 font-medium text-sm">Status</th>
              <th className="px-4 py-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentors.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-qosf-text-light">No mentors found.</td></tr>
            )}
            {mentors.map((mentor: Profile) => (
              <tr key={mentor.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedProfile(mentor)}
                    className="font-medium text-sm text-qosf-blue hover:underline text-left">
                    {mentor.full_name}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-qosf-text-light">{mentor.email}</td>
                <td className="px-4 py-3 text-sm">{mentor.timezone ?? "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {mentor.research_interests?.map((i: string) => (
                      <span key={i} className="bg-qosf-blue/10 text-qosf-blue text-xs px-2 py-0.5 rounded-full">{i}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(mentor.status)}`}>
                    {mentor.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {mentor.status !== "approved" && (
                      <button onClick={() => updateStatus(mentor.id, "approved")}
                        className="text-green-600 hover:text-green-800" title="Approve"><Check size={16} /></button>
                    )}
                    {mentor.status !== "rejected" && (
                      <button onClick={() => updateStatus(mentor.id, "rejected")}
                        className="text-red-600 hover:text-red-800" title="Reject"><X size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProfile && (
        <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}
