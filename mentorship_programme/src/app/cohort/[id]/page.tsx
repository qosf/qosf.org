import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, getCohortStatusLabel, getStatusColor } from "@/lib/utils";
import { Calendar, Clock, Users, Code, Award } from "lucide-react";
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

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, profile:profiles!submissions_user_id_fkey(id, full_name)")
    .eq("cohort_id", id)
    .in("status", ["submitted", "winner"])
    .order("created_at", { ascending: false });

  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("cohort_id", id)
    .order("event_date", { ascending: true });

  // Group accepted matches by mentor for display
  const mentorGroups = new Map<string, { mentor: any; mentees: any[] }>();
  for (const m of matches ?? []) {
    const key = m.mentor?.id ?? "unknown";
    if (!mentorGroups.has(key)) {
      mentorGroups.set(key, { mentor: m.mentor, mentees: [] });
    }
    mentorGroups.get(key)!.mentees.push(m.mentee);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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

      {/* Key dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            <span className="font-bold text-sm">Participants</span>
          </div>
          <p className="text-sm text-qosf-text-light">
            {mentorGroups.size} mentor{mentorGroups.size !== 1 ? "s" : ""}{" "}
            &middot; {matches?.length ?? 0} mentee{(matches?.length ?? 0) !== 1 ? "s" : ""}
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

      {/* Projects submitted for this cohort */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-qosf-blue mb-4">Projects</h2>
        {(!submissions || submissions.length === 0) ? (
          <p className="text-sm text-qosf-text-light">No projects submitted for this cohort yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {submissions.map((sub: any) => (
              <Link
                key={sub.id}
                href={`/project/${sub.id}`}
                className="border border-qosf-border rounded-lg p-4 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start gap-3">
                  <Code size={20} className="text-qosf-blue shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-qosf-blue truncate">
                        {sub.project_name}
                      </span>
                      {sub.is_winner && (
                        <Award size={14} className="text-yellow-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-qosf-text-light mt-1 line-clamp-2">
                      {sub.plotline}
                    </p>
                    {sub.profile && (
                      <p className="text-xs text-qosf-text-light mt-1">
                        by {sub.profile.full_name ?? "Unknown"}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mentors & Mentees (public) */}
      {mentorGroups.size > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-qosf-blue mb-4">Mentors &amp; Mentees</h2>
          <div className="space-y-6">
            {Array.from(mentorGroups.values()).map(({ mentor, mentees }) => (
              <div key={mentor?.id ?? "x"} className="border border-qosf-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-qosf-blue/10 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-qosf-blue" />
                  </div>
                  <div>
                    <Link
                      href={`/profile/${mentor?.id}`}
                      className="font-semibold text-sm text-qosf-blue hover:underline"
                    >
                      {mentor?.full_name ?? "Unknown Mentor"}
                    </Link>
                    <p className="text-xs text-qosf-text-light">Mentor</p>
                  </div>
                </div>
                <div className="ml-13 pl-4 border-l-2 border-qosf-accent/30 space-y-2">
                  {mentees.map((mentee: any) => (
                    <div key={mentee?.id} className="text-sm">
                      <Link
                        href={`/profile/${mentee?.id}`}
                        className="text-qosf-blue hover:underline"
                      >
                        {mentee?.full_name ?? "Unknown Mentee"}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches && matches.length === 0 && (
        <div className="text-center py-12 text-qosf-text-light">
          <Users size={40} className="mx-auto mb-3 opacity-50" />
          <p>No public matches yet for this cohort.</p>
        </div>
      )}
    </div>
  );
}
