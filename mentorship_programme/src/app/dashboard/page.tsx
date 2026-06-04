"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Users, UserCheck, Clock, Shield, FileText, Trash2 } from "lucide-react";
import { formatDate, getCohortStatusLabel, getStatusColor } from "@/lib/utils";
import type { Profile, Cohort } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
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

      // Admin users go straight to the admin panel
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

      // Fetch profile, cohorts, applications, matches in parallel
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

      // Fetch matches only if we have a profile
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-qosf-text-light">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <UserCheck size={48} className="mx-auto text-qosf-text-light mb-4" />
        <h3 className="text-xl font-bold text-qosf-blue mb-2">Get Started</h3>
        <p className="text-qosf-text-light">
          Choose your path below to apply for the mentorship program.
        </p>
      </div>
    );
  }

  const hasSubmittedApp = applications.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue">
            Dashboard
          </h1>
          <p className="text-qosf-text-light mt-1">
            Welcome, {profile.full_name || "(no name)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/profile/edit" className="text-sm text-qosf-blue hover:underline">
            Edit Profile
          </Link>
          {profile.role === "admin" && (
            <Link href="/admin/mentors" className="btn-secondary text-sm">
              <Shield size={16} /> Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Role selection — shown when no application has been submitted yet */}
      {!hasSubmittedApp && (
        <div className="mb-8">
          <h2 className="section-title">Choose Your Path</h2>
          <p className="text-qosf-text-light mb-6">
            Submit an application to join the mentorship program.
            Your submission will be reviewed by our team.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/apply?role=mentee" className="card block hover:shadow-lg transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-qosf-blue/10 rounded-full flex items-center justify-center shrink-0">
                  <UserCheck size={28} className="text-qosf-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-qosf-blue group-hover:text-qosf-accent transition-colors">
                    Apply as Mentee
                  </h3>
                  <p className="text-sm text-qosf-text-light mt-1">
                    I want to learn and work on an open-source quantum computing
                    project with expert guidance.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-qosf-blue font-medium mt-3">
                    Start application <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
            <Link href="/apply?role=mentor" className="card block hover:shadow-lg transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-qosf-accent/20 rounded-full flex items-center justify-center shrink-0">
                  <Users size={28} className="text-qosf-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-qosf-blue group-hover:text-qosf-accent transition-colors">
                    Apply as Mentor
                  </h3>
                  <p className="text-sm text-qosf-text-light mt-1">
                    I have expertise in quantum computing and want to guide
                    mentees through their projects.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-qosf-blue font-medium mt-3">
                    Start application <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Existing application status */}
      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="section-title">Your Applications</h2>
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-qosf-blue" />
                  <div>
                    <p className="font-medium capitalize">{app.role} Application</p>
                    <p className="text-xs text-qosf-text-light">
                      {app.cohort?.name ?? "General"} &middot; Submitted {formatDate(app.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(app.status === "draft" || app.status === "submitted") && (
                    <>
                      <Link
                        href={`/apply?role=${app.role}`}
                        className="text-xs text-qosf-blue hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete application"
                      >
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

      {/* Active cohorts */}
      {cohorts.length > 0 && (
        <div className="mb-8">
          <h2 className="section-title">Cohorts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {cohorts.map((cohort: Cohort) => (
              <Link key={cohort.id} href={`/cohort/${cohort.id}`} className="card block hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-qosf-blue">{cohort.name}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(cohort.status)}`}>
                    {getCohortStatusLabel(cohort.status)}
                  </span>
                </div>
                {cohort.description && (
                  <p className="text-sm text-qosf-text-light mb-3 line-clamp-2">{cohort.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-qosf-text-light">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Apps: {formatDate(cohort.application_start)} – {formatDate(cohort.application_end)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active matches */}
      {matches.length > 0 && (
        <div>
          <h2 className="section-title">Your Matches</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((match: any) => {
              const other = profile.role === "mentor" ? match.mentee : match.mentor;
              return (
                <div key={match.id} className="card">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-qosf-blue/10 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-qosf-blue" />
                    </div>
                    <div>
                      <p className="font-medium">{other?.full_name ?? "Unknown"}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(match.status)}`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasSubmittedApp && cohorts.length === 0 && matches.length === 0 && (
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
