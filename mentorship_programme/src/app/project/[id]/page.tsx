"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, GitBranch, Play, Globe, Calendar, Award, Code } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface SubmissionWithJoins {
  id: string;
  user_id: string;
  cohort_id: string;
  project_name: string;
  plotline: string;
  keywords: string[];
  project_description: string;
  repo_link?: string;
  demo_link?: string;
  video_link?: string;
  status: string;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
  profile?: { id: string; full_name?: string; role?: string };
  cohort?: { id: string; name?: string };
}

function isFacebookUrl(url: string): boolean {
  return /facebook\.com|fb\.watch/i.test(url);
}

/**
 * Fetch Facebook oEmbed thumbnail URL for a video.
 */
async function fetchFacebookThumbnail(url: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.facebook.com/plugins/video/oembed.json?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export default function ProjectPage() {
  const params = useParams();
  const supabase = createClient();

  const [submission, setSubmission] = useState<SubmissionWithJoins | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const id = params.id as string;
      const { data: sub } = await supabase
        .from("submissions")
        .select("*, profile:profiles!submissions_user_id_fkey(id, full_name, role), cohort:cohorts!submissions_cohort_id_fkey(id, name)")
        .eq("id", id)
        .single();

      if (!sub) {
        if (!cancelled) setNotFound(true);
        if (!cancelled) setLoading(false);
        return;
      }

      // Check ownership (use local variable, not state)
      let owned = false;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        if (prof && sub.user_id === prof.id) {
          owned = true;
        }
      }

      if (!cancelled) setIsOwner(owned);

      // Drafts are only visible to the owner
      if (sub.status === "draft" && !owned) {
        if (!cancelled) setNotFound(true);
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setSubmission(sub);

      // Fetch Facebook thumbnail if it's a FB video
      if (sub.video_link && isFacebookUrl(sub.video_link)) {
        if (!cancelled) setHeroLoading(true);
        const thumb = await fetchFacebookThumbnail(sub.video_link);
        if (thumb && !cancelled) setHeroImage(thumb);
        if (!cancelled) setHeroLoading(false);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-qosf-text-light">Loading...</p>
      </div>
    );
  }

  if (notFound || !submission) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Code size={48} className="mx-auto text-qosf-text-light mb-4" />
        <h1 className="text-2xl font-bold text-qosf-blue mb-2">Not Found</h1>
        <p className="text-qosf-text-light mb-6">
          This project is not available or you don&apos;t have access.
        </p>
        <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero image from Facebook video */}
      {heroImage && (
        <div className="rounded-lg overflow-hidden mb-8 aspect-video bg-gray-100">
          <img
            src={heroImage}
            alt={`${submission.project_name} video thumbnail`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue">
                {submission.project_name}
              </h1>
              {submission.is_winner && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <Award size={14} /> Winner
                </span>
              )}
            </div>
            <p className="text-qosf-text-light text-sm md:text-base">
              {submission.plotline}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${getStatusColor(submission.status)}`}>
            {submission.status}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-qosf-text-light">
          {submission.profile && (
            <Link
              href={`/profile/${submission.profile.id}`}
              className="flex items-center gap-1.5 text-qosf-blue hover:underline"
            >
              <Code size={16} />
              {submission.profile.full_name ?? "Unknown"}
            </Link>
          )}
          {submission.cohort && (
            <Link
              href={`/cohort/${submission.cohort.id}`}
              className="flex items-center gap-1.5 text-qosf-blue hover:underline"
            >
              <Calendar size={16} />
              {submission.cohort.name ?? "Cohort"}
            </Link>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={16} />
            Submitted {formatDate(submission.created_at)}
          </span>
        </div>
      </div>

      {/* Keywords */}
      {submission.keywords && submission.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {submission.keywords.map((kw) => (
            <span key={kw} className="bg-qosf-blue/10 text-qosf-blue text-xs px-3 py-1 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Links bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {submission.repo_link && (
          <a
            href={submission.repo_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <GitBranch size={16} /> Repository
          </a>
        )}
        {submission.demo_link && (
          <a
            href={submission.demo_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <Globe size={16} /> Demo
          </a>
        )}
        {submission.video_link && (
          <a
            href={submission.video_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <Play size={16} /> Watch Video
          </a>
        )}
      </div>

      {/* Description (Markdown) */}
      <div className="card">
        <h2 className="text-xl font-bold text-qosf-blue mb-4">Project Description</h2>
        <MarkdownRenderer content={submission.project_description} />
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="mt-6 text-center">
          <Link
            href={`/submit/${submission.id}`}
            className="text-sm text-qosf-blue hover:underline"
          >
            Edit Project &rarr;
          </Link>
        </div>
      )}

      <div className="text-center mt-6">
        <Link href="/dashboard" className="text-sm text-qosf-blue hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
