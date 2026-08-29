import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExternalLink, GraduationCap, MapPin, Users, Globe, Code } from "lucide-react";
import Link from "next/link";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  if (!profile) notFound();

  // Cohorts this user participated in (via matches)
  const matchColumn = profile.role === "mentor" ? "mentor_id" : "mentee_id";
  const { data: participations } = await supabase
    .from("matches")
    .select("*, cohort:cohorts!matches_cohort_id_fkey(name, status, mentorship_start, mentorship_end)")
    .eq(matchColumn, id)
    .in("status", ["accepted", "completed"]);

  // Projects (submissions) by this user — only show submitted/winner ones
  const { data: userSubmissions } = await supabase
    .from("submissions")
    .select("*, cohort:cohorts!submissions_cohort_id_fkey(id, name)")
    .eq("user_id", id)
    .in("status", ["submitted", "winner"])
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-qosf-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={36} className="text-qosf-blue" />
          </div>
          <h1 className="text-2xl font-bold text-qosf-blue">{profile.full_name}</h1>
          <p className="text-sm text-qosf-text-light capitalize mt-1">
            {profile.role}
          </p>
        </div>

        <div className="space-y-4">
          {profile.bio && (
            <div>
              <h3 className="text-sm font-semibold text-qosf-text-light mb-1">About</h3>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.pronouns && (
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-qosf-text-light shrink-0" />
                <span>{profile.pronouns}</span>
              </div>
            )}
            {profile.country && (
              <div className="flex items-center gap-2 text-sm">
                <Globe size={16} className="text-qosf-text-light shrink-0" />
                <span>{profile.country}</span>
              </div>
            )}
            {profile.timezone && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-qosf-text-light shrink-0" />
                <span>{profile.timezone}</span>
              </div>
            )}
            {profile.academic_degree && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap size={16} className="text-qosf-text-light shrink-0" />
                <span>{profile.academic_degree}</span>
              </div>
            )}
            {profile.institution && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap size={16} className="text-qosf-text-light shrink-0" />
                <span>{profile.institution}</span>
              </div>
            )}
          </div>

          {profile.research_interests && profile.research_interests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-qosf-text-light mb-2">Research Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.research_interests.map((i: string) => (
                  <span key={i} className="bg-qosf-blue/10 text-qosf-blue text-xs px-3 py-1 rounded-full">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4 border-t border-qosf-border">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-qosf-blue hover:underline">
                <ExternalLink size={16} /> LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-qosf-blue hover:underline">
                <ExternalLink size={16} /> GitHub
              </a>
            )}
          </div>
        </div>

        {/* Projects */}
        {userSubmissions && userSubmissions.length > 0 && (
          <div className="pt-4 border-t border-qosf-border mt-4">
            <h3 className="text-sm font-semibold text-qosf-text-light mb-3">
              Projects
            </h3>
            <div className="space-y-2">
              {userSubmissions.map((sub: any) => (
                <div key={sub.id} className="text-sm">
                  <Link
                    href={`/project/${sub.id}`}
                    className="text-qosf-blue hover:underline font-medium flex items-center gap-1.5"
                  >
                    <Code size={14} />
                    {sub.project_name}
                  </Link>
                  <span className="text-qosf-text-light">
                    {" "}&middot; {sub.cohort?.name ?? "Cohort"}
                    {sub.is_winner && (
                      <span className="ml-2 text-yellow-700 font-medium">Winner</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cohort participation */}
        {participations && participations.length > 0 && (
          <div className="pt-4 border-t border-qosf-border mt-4">
            <h3 className="text-sm font-semibold text-qosf-text-light mb-3">
              Cohort{participations.length > 1 ? "s" : ""} participated
            </h3>
            <div className="space-y-2">
              {participations.map((p: any) => (
                <div key={p.id} className="text-sm">
                  <Link
                    href={`/cohort/${p.cohort_id}`}
                    className="text-qosf-blue hover:underline font-medium"
                  >
                    {p.cohort?.name ?? "Cohort"}
                  </Link>
                  <span className="text-qosf-text-light">
                    {" "}&middot; {profile.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
