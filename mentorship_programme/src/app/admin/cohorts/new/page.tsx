"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCohortPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    name: "",
    description: "",
    application_start: "",
    application_end: "",
    mentorship_start: "",
    mentorship_end: "",
    status: "upcoming" as const,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("cohorts").insert({
      name: form.name,
      description: form.description,
      application_start: new Date(form.application_start).toISOString(),
      application_end: new Date(form.application_end).toISOString(),
      mentorship_start: new Date(form.mentorship_start).toISOString(),
      mentorship_end: new Date(form.mentorship_end).toISOString(),
      status: form.status,
      created_by: user?.id,
    });

    setLoading(false);

    if (error) {
      alert("Error creating cohort: " + error.message);
      return;
    }

    router.push("/admin/cohorts");
    router.refresh();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/cohorts" className="flex items-center gap-1 text-qosf-text-light hover:text-qosf-blue text-sm mb-6">
        <ArrowLeft size={16} /> Back to Cohorts
      </Link>
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">New Cohort</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Cohort Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            placeholder="e.g., Cohort 10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Description (Markdown)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg font-mono text-sm"
            placeholder="Describe the cohort in markdown..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-qosf-text mb-1">Application Start</label>
            <input
              name="application_start"
              type="datetime-local"
              value={form.application_start}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-qosf-text mb-1">Application End</label>
            <input
              name="application_end"
              type="datetime-local"
              value={form.application_end}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-qosf-text mb-1">Mentorship Start</label>
            <input
              name="mentorship_start"
              type="datetime-local"
              value={form.mentorship_start}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-qosf-text mb-1">Mentorship End</label>
            <input
              name="mentorship_end"
              type="datetime-local"
              value={form.mentorship_end}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-qosf-border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2 border border-qosf-border rounded-lg"
          >
            <option value="upcoming">Upcoming</option>
            <option value="open">Open (Applications)</option>
            <option value="active">Active (In Progress)</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-primary justify-center w-full md:w-auto">
          {loading ? "Creating..." : "Create Cohort"}
        </button>
      </form>
    </div>
  );
}