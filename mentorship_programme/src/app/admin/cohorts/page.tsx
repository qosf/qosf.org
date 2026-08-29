import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, getCohortStatusLabel, getStatusColor } from "@/lib/utils";
import type { Cohort } from "@/lib/types";
import Link from "next/link";

export default async function AdminCohortsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <div className="container mx-auto px-4 py-8"><p>Please log in.</p></div>;
  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-qosf-blue">Cohorts</h1>
        <Link href="/admin/cohorts/new" className="btn-primary text-sm">
          New Cohort
        </Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-qosf-blue text-white text-left">
              <th className="px-4 py-3 font-medium text-sm">Name</th>
              <th className="px-4 py-3 font-medium text-sm">Status</th>
              <th className="px-4 py-3 font-medium text-sm">Applications</th>
              <th className="px-4 py-3 font-medium text-sm">Mentorship Period</th>
              <th className="px-4 py-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!cohorts || cohorts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-qosf-text-light">
                  No cohorts created yet.
                </td>
              </tr>
            )}
            {cohorts?.map((cohort: Cohort) => (
              <tr key={cohort.id} className="border-t border-qosf-border hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/cohort/${cohort.id}`} className="text-qosf-blue hover:underline">
                    {cohort.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(cohort.status)}`}>
                    {getCohortStatusLabel(cohort.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(cohort.application_start)} – {formatDate(cohort.application_end)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(cohort.mentorship_start)} – {formatDate(cohort.mentorship_end)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/cohort/${cohort.id}`} className="text-qosf-blue text-sm hover:underline">
                      View
                    </Link>
                    <Link href={`/admin/cohorts/${cohort.id}/edit`} className="text-qosf-accent text-sm hover:underline">
                      Edit
                    </Link>
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