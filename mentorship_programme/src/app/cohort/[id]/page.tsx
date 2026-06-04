import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate, getCohortStatusLabel, getStatusColor } from "@/lib/utils";
import { Calendar, Clock, Users } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("*")
    .eq("id", id)
    .single();

  if (!cohort) notFound();

  const { data: matches } = await supabase
    .from("matches")
    .select("*, mentor:profiles!matches_mentor_id_fkey(*), mentee:profiles!matches_mentee_id_fkey(*)")
    .eq("cohort_id", id)
    .in("status", ["accepted", "completed"]);

  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("cohort_id", id)
    .order("event_date", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cohort header */}
      <div className="hero-subheader rounded-lg mb-8 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{cohort.name}</h1>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(cohort.status)}`}>
              {getCohortStatusLabel(cohort.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 text-qosf-blue mb-2">
            <Calendar size={18} />
            <span className="font-bold text-sm">Applications</span>
          </div>
          <p className="text-sm text-qosf-text-light">
            {formatDate(cohort.application_start)} – {formatDate(cohort.application_end)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-qosf-blue mb-2">
            <Clock size={18} />
            <span className="font-bold text-sm">Mentorship Period</span>
          </div>
          <p className="text-sm text-qosf-text-light">
            {formatDate(cohort.mentorship_start)} – {formatDate(cohort.mentorship_end)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-qosf-blue mb-2">
            <Users size={18} />
            <span className="font-bold text-sm">Matches</span>
          </div>
          <p className="text-sm text-qosf-text-light">
            {matches?.length ?? 0} active matches
          </p>
        </div>
      </div>

      {/* Description */}
      {cohort.description && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-qosf-blue mb-4">About</h2>
          <MarkdownRenderer content={cohort.description} />
        </div>
      )}

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-qosf-blue mb-4">Timeline</h2>
          <div className="space-y-4">
            {timeline.map((event: any) => (
              <div key={event.id} className="flex items-start gap-4 pb-4 border-b border-qosf-border last:border-0">
                <div className="w-2.5 h-2.5 rounded-full bg-qosf-accent mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-qosf-blue">{event.title}</p>
                  <p className="text-xs text-qosf-text-light">{formatDate(event.event_date)}</p>
                  {event.description && (
                    <p className="text-sm text-qosf-text-light mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public matches */}
      {matches && matches.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-qosf-blue mb-4">Projects & Matches</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((match: any) => (
              <div key={match.id} className="border border-qosf-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-qosf-blue/10 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-qosf-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {match.mentor?.full_name} &times; {match.mentee?.full_name}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}