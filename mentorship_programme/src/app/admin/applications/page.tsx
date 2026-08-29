"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStatusColor } from "@/lib/utils";
import { Check, X, RotateCcw } from "lucide-react";
import ProfileModal from "@/components/ProfileModal";
import type { Profile } from "@/lib/types";

export default function AdminApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!apps) { setApplications([]); return; }

      const userIds = apps.map((a: any) => a.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

      setApplications(
        apps.map((a: any) => ({ ...a, profile: profileMap.get(a.user_id) ?? null })),
      );
    })();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error: appErr } = await supabase.from("applications").update({ status }).eq("id", id);
    if (appErr) { alert("Failed to update application: " + appErr.message); return; }
    const app = applications.find((a) => a.id === id);
    if (app) {
      const { error: profErr } = await supabase.from("profiles").update({ status }).eq("user_id", app.user_id);
      if (profErr) { alert("Failed to update profile: " + profErr.message); return; }
    }
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">Applications</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-qosf-blue text-white text-left">
              <th className="px-4 py-3 font-medium text-sm">Name</th>
              <th className="px-4 py-3 font-medium text-sm">Email</th>
              <th className="px-4 py-3 font-medium text-sm">Role</th>
              <th className="px-4 py-3 font-medium text-sm">Status</th>
              <th className="px-4 py-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-qosf-text-light">No applications yet.</td></tr>
            )}
            {applications.map((app: any) => (
              <tr key={app.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedProfile(app.profile)}
                    className="font-medium text-sm text-qosf-blue hover:underline text-left">
                    {app.profile?.full_name ?? "—"}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-qosf-text-light">{app.profile?.email ?? "—"}</td>
                <td className="px-4 py-3 text-sm capitalize">{app.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {app.status === "submitted" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(app.id, "approved")}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"><Check size={16} /> Approve</button>
                      <button onClick={() => updateStatus(app.id, "rejected")}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"><X size={16} /> Reject</button>
                    </div>
                  )}
                  {app.status !== "submitted" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(app.id, "submitted")}
                        className="text-qosf-text-light hover:text-qosf-blue flex items-center gap-1 text-sm"
                        title="Reset to submitted"><RotateCcw size={16} /></button>
                    </div>
                  )}
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
