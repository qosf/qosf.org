"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Send, Save, Trash2 } from "lucide-react";

const MAX_NAME = 40;
const MAX_PLOTLINE = 200;
const MAX_DESC = 2500;

export default function EditSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [plotline, setPlotline] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const id = params.id as string;
      const { data: sub } = await supabase
        .from("submissions")
        .select("*, cohort:cohorts(application_end)")
        .eq("id", id)
        .single();

      if (!sub) {
        setError("Submission not found.");
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!prof || sub.user_id !== prof.id) {
        router.push("/dashboard");
        return;
      }

      setSubmissionId(sub.id);
      setProjectName(sub.project_name ?? "");
      setPlotline(sub.plotline ?? "");
      setKeywords((sub.keywords ?? []).join(", "));
      setDescription(sub.project_description ?? "");
      setRepoLink(sub.repo_link ?? "");
      setDemoLink(sub.demo_link ?? "");
      setVideoLink(sub.video_link ?? "");
      setStatus(sub.status);

      const deadline = sub.cohort?.application_end;
      if (deadline && new Date(deadline) < new Date()) {
        setDeadlinePassed(true);
      }

      setLoading(false);
    })();
  }, []);

  const handleSubmit = useCallback(async (newStatus: "draft" | "submitted") => {
    if (!submissionId) return;
    setSubmitting(true);
    setError(null);

    if (!projectName.trim()) { setError("Project name is required."); setSubmitting(false); return; }
    if (!plotline.trim()) { setError("Plotline is required."); setSubmitting(false); return; }
    if (!description.trim()) { setError("Project description is required."); setSubmitting(false); return; }

    const { error: err } = await supabase
      .from("submissions")
      .update({
        project_name: projectName.trim(),
        plotline: plotline.trim(),
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        project_description: description.trim(),
        repo_link: repoLink.trim() || null,
        demo_link: demoLink.trim() || null,
        video_link: videoLink.trim() || null,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    setSubmitting(false);
    if (err) { setError(err.message); return; }
    router.push("/dashboard");
  }, [submissionId, projectName, plotline, keywords, description, repoLink, demoLink, videoLink]);

  async function handleDelete() {
    if (!submissionId || !confirm("Delete this project forever?")) return;
    await supabase.from("submissions").delete().eq("id", submissionId);
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-qosf-text-light">Loading...</p>
      </div>
    );
  }

  if (error && !submissionId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <p className="text-qosf-text-light mb-4">{error}</p>
        <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue mb-2">Edit Project</h1>
      <p className="text-qosf-text-light mb-8">
        Status: <span className="font-medium capitalize">{status}</span>
        {deadlinePassed && (
          <span className="ml-2 text-red-500 text-sm">(Deadline passed — changes limited)</span>
        )}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="card space-y-6">
        {/* Project name */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">
            Project Name * <span className="text-qosf-text-light font-normal">({projectName.length}/{MAX_NAME})</span>
          </label>
          <input
            type="text"
            maxLength={MAX_NAME}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
          />
        </div>

        {/* Plotline */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">
            Plotline / Pitch * <span className="text-qosf-text-light font-normal">({plotline.length}/{MAX_PLOTLINE})</span>
          </label>
          <textarea
            maxLength={MAX_PLOTLINE}
            value={plotline}
            onChange={(e) => setPlotline(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg resize-none"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Keywords (comma separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">
            Project Description * (Markdown) <span className="text-qosf-text-light font-normal">({description.length}/{MAX_DESC})</span>
          </label>
          <textarea
            maxLength={MAX_DESC}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg font-mono text-sm"
          />
        </div>

        {/* Links — one per row */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Repository Link</label>
          <input
            type="url"
            value={repoLink}
            onChange={(e) => setRepoLink(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Demo Link</label>
          <input
            type="url"
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Video Link</label>
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-qosf-border">
          {!deadlinePassed && (
            <>
              <button
                onClick={() => handleSubmit("submitted")}
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                <Send size={16} />
                {submitting ? "Submitting..." : status === "submitted" ? "Update & Resubmit" : "Submit Project"}
              </button>
              <button
                onClick={() => handleSubmit("draft")}
                disabled={submitting}
                className="btn-secondary flex items-center gap-2"
              >
                <Save size={16} />
                {submitting ? "Saving..." : "Save Draft"}
              </button>
            </>
          )}
          {deadlinePassed && (
            <p className="text-sm text-qosf-text-light italic py-2">
              The submission deadline has passed. You can no longer edit this project.
            </p>
          )}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 ml-auto"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
