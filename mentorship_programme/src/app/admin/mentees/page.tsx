import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStatusColor } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import Link from "next/link";

export default async function AdminMenteesPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <div className="container mx-auto px-4 py-8"><p>Please log in.</p></div>;
  const { data: mentees } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "mentee")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">Mentees</h1>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-qosf-blue text-white text-left">
              <th className="px-4 py-3 font-medium text-sm">Name</th>
              <th className="px-4 py-3 font-medium text-sm">Email</th>
              <th className="px-4 py-3 font-medium text-sm">Education</th>
              <th className="px-4 py-3 font-medium text-sm">Interests</th>
              <th className="px-4 py-3 font-medium text-sm">Status</th>
              <th className="px-4 py-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!mentees || mentees.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-qosf-text-light">
                  No mentees found.
                </td>
              </tr>
            )}
            {mentees?.map((mentee: Profile) => (
              <tr key={mentee.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{mentee.full_name}</td>
                <td className="px-4 py-3 text-sm text-qosf-text-light">{mentee.email}</td>
                <td className="px-4 py-3 text-sm">{mentee.educational_level ?? "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {mentee.research_interests?.map((i: string) => (
                      <span key={i} className="bg-qosf-blue/10 text-qosf-blue text-xs px-2 py-0.5 rounded-full">{i}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(mentee.status)}`}>
                    {mentee.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/cohort?mentee=${mentee.id}`} className="text-qosf-blue text-sm hover:underline">
                    View Matches
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}