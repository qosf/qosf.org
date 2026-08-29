"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Send, Save } from "lucide-react";
import type { Cohort } from "@/lib/types";

const MAX_NAME = 40;
const MAX_PLOTLINE = 200;
const MAX_DESC = 2500;

export default function NewSubmissionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortId, setCohortId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [plotline, setPlotline] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: c } = await supabase
        .from("cohorts")
        .select("*")
        .in("status", ["open", "active"])
        .order("application_start", { ascending: true });
      setCohorts(c ?? []);
      if (c && c.length > 0) setCohortId(c[0].id);
    })();
  }, []);

  const handleSubmit = useCallback(async (status: "draft" | "submitted") => {
    setSubmitting(true);
    setError(null);

    if (!projectName.trim()) { setError("Project name is required."); setSubmitting(false); return; }
    if (!plotline.trim()) { setError("Plotline is required."); setSubmitting(false); return; }
    if (!description.trim()) { setError("Project description is required."); setSubmitting(false); return; }
    if (!cohortId) { setError("Select a cohort."); setSubmitting(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!prof) { setError("Profile not found."); setSubmitting(false); return; }

    const { error: err } = await supabase.from("submissions").insert({
      user_id: prof.id,
      cohort_id: cohortId,
      project_name: projectName.trim(),
      plotline: plotline.trim(),
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      project_description: description.trim(),
      repo_link: repoLink.trim() || null,
      demo_link: demoLink.trim() || null,
      video_link: videoLink.trim() || null,
      status,
    });

    setSubmitting(false);
    if (err) { setError(err.message); return; }
    router.push("/dashboard");
  }, [projectName, plotline, keywords, description, repoLink, demoLink, videoLink, cohortId]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue mb-2">New Project</h1>
      <p className="text-qosf-text-light mb-8">Submit your project for the mentorship programme.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="card space-y-6">
        {/* Cohort selector */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Cohort *</label>
          <select
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
          >
            {cohorts.length === 0 && <option value="">No cohorts available</option>}
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

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
            placeholder="e.g., Quantum Error Correction Toolkit"
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
            placeholder="Short pitch for your project..."
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
            placeholder="e.g., error correction, qiskit, stabilizer codes"
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
            placeholder="Describe your project using Markdown...&#10;&#10;## Overview&#10;...&#10;&#10;## Methods&#10;...&#10;&#10;## Results&#10;..."
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
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Demo Link</label>
          <input
            type="url"
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            placeholder="https://demo.example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1.5">Video Link</label>
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            placeholder="https://facebook.com/watch/..."
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-qosf-border">
          <button
            onClick={() => handleSubmit("submitted")}
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit Project"}
          </button>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="btn-secondary flex items-center gap-2"
          >
            <Save size={16} />
            {submitting ? "Saving..." : "Save Draft"}
          </button>
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
