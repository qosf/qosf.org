"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Users, UserCheck, Clock, Shield, FileText, Trash2, Code, ExternalLink, Settings } from "lucide-react";
import { formatDate, getCohortStatusLabel, getStatusColor } from "@/lib/utils";
import type { Profile, Cohort } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function deleteApplication(id: string) {
    if (!confirm("Delete this application?")) return;
    await supabase.from("applications").delete().eq("id", id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: roleCheck } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (roleCheck?.role === "admin") {
        router.push("/admin/applications");
        return;
      }

      const [profileRes, cohortsRes, appsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).limit(1),
        supabase.from("cohorts").select("*").order("created_at", { ascending: false }),
        supabase.from("applications").select("*, cohort:cohorts(name)").eq("user_id", user.id),
      ]);

      if (cancelled) return;

      const p = profileRes.data?.[0] ?? null;
      setProfile(p);
      setCohorts(cohortsRes.data ?? []);
      setApplications(appsRes.data ?? []);

      const { data: subs } = await supabase
        .from("submissions")
        .select("*, cohort:cohorts(name, status, application_end)")
        .eq("user_id", p?.id ?? "")
        .order("created_at", { ascending: false });
      setSubmissions(subs ?? []);

      if (p) {
        const matchColumn = p.role === "mentor" ? "mentor_id" : "mentee_id";
        const { data: m } = await supabase
          .from("matches")
          .select("*, mentor:profiles!matches_mentor_id_fkey(*), mentee:profiles!matches_mentee_id_fkey(*)")
          .eq(matchColumn, p.id);
        setMatches(m ?? []);
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-qosf-text-light">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <UserCheck size={48} className="mx-auto text-qosf-text-light mb-4" />
        <h2 className="text-xl font-bold text-qosf-blue mb-2">Get Started</h2>
        <p className="text-qosf-text-light mb-6">
          Choose your path below to apply for the mentorship program.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/apply?role=mentee" className="btn-primary">Apply as Mentee</Link>
          <Link href="/apply?role=mentor" className="btn-secondary">Apply as Mentor</Link>
        </div>
      </div>
    );
  }

  const hasSubmittedApp = applications.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Blue hero card ── */}
      <div className="hero-subheader rounded-lg mb-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Hi, {profile.full_name || "there"}
            </h1>
            <p className="text-white/80 text-sm">
              {profile.role === "mentee" ? "Mentee" : profile.role === "mentor" ? "Mentor" : ""}
              {profile.pronouns && <> &middot; {profile.pronouns}</>}
              {profile.institution && <> &middot; {profile.institution}</>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${profile.id}`}
              className="text-white/80 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink size={14} /> Public Profile
            </Link>
            <Link
              href="/profile/edit"
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-colors"
            >
              <Settings size={14} /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ── Role selection cards ── */}
      {!hasSubmittedApp && (
        <div className="mb-8">
          <h2 className="text-lg md:text-xl font-bold text-qosf-blue mb-4">Choose Your Path</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/apply?role=mentee" className="card block hover:shadow-lg transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-qosf-blue/10 rounded-full flex items-center justify-center shrink-0">
                  <UserCheck size={24} className="text-qosf-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-qosf-blue group-hover:text-qosf-accent transition-colors">
                    Apply as Mentee
                  </h3>
                  <p className="text-sm text-qosf-text-light mt-0.5">
                    Work on an open-source quantum computing project with expert guidance.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-qosf-blue font-medium mt-2">
                    Start application <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
            <Link href="/apply?role=mentor" className="card block hover:shadow-lg transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-qosf-accent/20 rounded-full flex items-center justify-center shrink-0">
                  <Users size={24} className="text-qosf-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-qosf-blue group-hover:text-qosf-accent transition-colors">
                    Apply as Mentor
                  </h3>
                  <p className="text-sm text-qosf-text-light mt-0.5">
                    Guide mentees through their quantum computing projects.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-qosf-blue font-medium mt-2">
                    Start application <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── Applications section ── */}
      {applications.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-qosf-blue">Your Applications</h2>
          </div>
          <div className="divide-y divide-qosf-border">
            {applications.map((app: any) => (
              <div key={app.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-qosf-blue shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium capitalize text-sm">{app.role} Application</p>
                    <p className="text-xs text-qosf-text-light">
                      {app.cohort?.name ?? "General"} &middot; {formatDate(app.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {(app.status === "draft" || app.status === "submitted") && (
                    <>
                      <Link href={`/apply?role=${app.role}`}
                        className="text-xs text-qosf-blue hover:underline font-medium">Edit</Link>
                      <button onClick={() => deleteApplication(app.id)}
                        className="text-red-500 hover:text-red-700" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Submissions section (mentees) ── */}
      {profile.role === "mentee" && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-qosf-blue">My Projects</h2>
            <Link href="/submit" className="btn-primary text-sm py-1.5 px-4 font-bold">+ New Project</Link>
          </div>
          {submissions.length === 0 ? (
            <p className="text-sm text-qosf-text-light py-2">You haven&apos;t submitted any projects yet.</p>
          ) : (
            <div className="divide-y divide-qosf-border">
              {submissions.map((sub: any) => {
                const deadlinePassed = sub.cohort?.application_end
                  ? new Date(sub.cohort.application_end) < new Date() : false;
                const canEdit = sub.status === "draft" || (sub.status === "submitted" && !deadlinePassed);
                return (
                  <div key={sub.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <Code size={20} className="text-qosf-blue shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/project/${sub.id}`}
                            className="font-medium text-sm truncate text-qosf-blue hover:underline">
                            {sub.project_name}
                          </Link>
                          {sub.is_winner && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium shrink-0">Winner</span>
                          )}
                        </div>
                        <p className="text-xs text-qosf-text-light truncate mt-0.5">
                          {sub.cohort?.name ?? ""}
                          {sub.status !== "draft" && sub.plotline && <> &middot; {sub.plotline.substring(0, 60)}&hellip;</>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/project/${sub.id}`}
                        className="text-xs text-qosf-blue hover:underline font-medium">
                        View
                      </Link>
                      {canEdit && (
                        <Link href={`/submit/${sub.id}`}
                          className="text-xs text-qosf-blue hover:underline font-medium">Edit</Link>
                      )}
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Cohorts section ── */}
      {cohorts.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg md:text-xl font-bold text-qosf-blue mb-4">Cohorts</h2>
          {cohorts.length === 0 ? (
            <p className="text-sm text-qosf-text-light py-2">No cohorts available.</p>
          ) : (
            <div className="divide-y divide-qosf-border">
              {cohorts.map((cohort: Cohort) => (
                <Link key={cohort.id} href={`/cohort/${cohort.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 rounded transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-qosf-blue">{cohort.name}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(cohort.status)}`}>
                        {getCohortStatusLabel(cohort.status)}
                      </span>
                    </div>
                    {cohort.description && (
                      <p className="text-xs text-qosf-text-light mt-0.5 line-clamp-1">{cohort.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-qosf-text-light shrink-0">
                    <Clock size={12} />
                    <span>{formatDate(cohort.application_start)} – {formatDate(cohort.application_end)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Matches section ── */}
      {matches.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg md:text-xl font-bold text-qosf-blue mb-4">Your Matches</h2>
          <div className="divide-y divide-qosf-border">
            {matches.map((match: any) => {
              const other = profile.role === "mentor" ? match.mentee : match.mentor;
              return (
                <div key={match.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-qosf-blue/10 rounded-full flex items-center justify-center shrink-0">
                      <Users size={18} className="text-qosf-blue" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/profile/${other?.id}`}
                        className="font-medium text-sm text-qosf-blue hover:underline">
                        {other?.full_name ?? "Unknown"}
                      </Link>
                      <p className="text-xs text-qosf-text-light capitalize">
                        {profile.role === "mentor" ? "Mentee" : "Mentor"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!hasSubmittedApp && cohorts.length === 0 && matches.length === 0 && profile.role !== "mentee" && (
        <div className="text-center py-12">
          <UserCheck size={48} className="mx-auto text-qosf-text-light mb-4" />
          <h3 className="text-xl font-bold text-qosf-blue mb-2">Get Started</h3>
          <p className="text-qosf-text-light">
            Choose your path above to apply for the mentorship program.
          </p>
        </div>
      )}
    </div>
  );
}
