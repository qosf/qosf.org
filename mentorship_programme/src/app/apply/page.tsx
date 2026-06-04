"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SurveyForm from "@/components/SurveyForm";
import { FileText, AlertCircle, CalendarClock } from "lucide-react";
import type { Cohort } from "@/lib/types";

const menteeSurveyJson = {
  title: "Mentee Application",
  description: "Tell us about yourself and your interests.",
  pages: [
    {
      elements: [
        {
          type: "text",
          name: "full_name",
          title: "Full Name",
          isRequired: true,
        },
        {
          type: "text",
          name: "educational_level",
          title: "Educational Level",
          isRequired: true,
          placeholder: "e.g., Bachelor's in Physics, Master's in CS, PhD candidate...",
        },
        {
          type: "checkbox",
          name: "research_interests",
          title: "Research Interests",
          isRequired: true,
          choices: [
            "Quantum Computing Theory",
            "Quantum Algorithms",
            "Quantum Error Correction",
            "Quantum Machine Learning",
            "Quantum Information Science",
            "Quantum Hardware",
            "Quantum Cryptography",
            "Open Source Development",
            "Quantum Simulation",
            "Other",
          ],
        },
        {
          type: "text",
          name: "timezone",
          title: "Timezone",
          isRequired: true,
          placeholder: "e.g., America/New_York, Europe/Berlin, Asia/Tokyo",
        },
        {
          type: "text",
          name: "linkedin_url",
          title: "LinkedIn Profile URL",
          inputType: "url",
        },
        {
          type: "text",
          name: "github_url",
          title: "GitHub Profile URL",
          inputType: "url",
        },
        {
          type: "text",
          name: "keywords",
          title: "Keywords (comma separated)",
          placeholder: "e.g., qiskit, cirq, quantum chemistry, open source",
        },
        {
          type: "comment",
          name: "bio",
          title: "Biopic / Short Bio",
          maxLength: 1000,
        },
        {
          type: "comment",
          name: "motivation",
          title: "Why do you want to join this mentorship program?",
          maxLength: 2000,
        },
      ],
    },
  ],
};

const mentorSurveyJson = {
  title: "Mentor Application",
  description: "Share your expertise and availability.",
  pages: [
    {
      elements: [
        {
          type: "text",
          name: "full_name",
          title: "Full Name",
          isRequired: true,
        },
        {
          type: "text",
          name: "educational_level",
          title: "Educational Level / Position",
          isRequired: true,
          placeholder: "e.g., PhD, Professor, Industry Researcher...",
        },
        {
          type: "checkbox",
          name: "research_interests",
          title: "Areas of Expertise",
          isRequired: true,
          choices: [
            "Quantum Computing Theory",
            "Quantum Algorithms",
            "Quantum Error Correction",
            "Quantum Machine Learning",
            "Quantum Information Science",
            "Quantum Hardware",
            "Quantum Cryptography",
            "Open Source Development",
            "Quantum Simulation",
            "Other",
          ],
        },
        {
          type: "text",
          name: "timezone",
          title: "Timezone",
          isRequired: true,
          placeholder: "e.g., America/New_York, Europe/Berlin, Asia/Tokyo",
        },
        {
          type: "text",
          name: "linkedin_url",
          title: "LinkedIn Profile URL",
          inputType: "url",
        },
        {
          type: "text",
          name: "github_url",
          title: "GitHub Profile URL",
          inputType: "url",
        },
        {
          type: "text",
          name: "keywords",
          title: "Keywords (comma separated)",
          placeholder: "e.g., qiskit, cirq, quantum chemistry, open source",
        },
        {
          type: "comment",
          name: "bio",
          title: "Professional Bio",
          maxLength: 1000,
        },
        {
          type: "comment",
          name: "mentorship_philosophy",
          title: "Describe your mentorship approach",
          maxLength: 2000,
        },
        {
          type: "text",
          name: "max_mentees",
          title: "Maximum number of mentees you can take",
          inputType: "number",
          defaultValue: 1,
        },
      ],
    },
  ],
};

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as "mentee" | "mentor" | null;
  const supabase = createClient();

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setIsAuthenticated(true);
      setAuthChecked(true);

      const { data: c } = await supabase
        .from("cohorts")
        .select("*")
        .in("status", ["upcoming", "open"])
        .order("application_start", { ascending: true });
      setCohorts(c ?? []);
      if (c && c.length > 0) setSelectedCohort(c[0].id);
    }
    init();
  }, []);

  if (!authChecked) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-qosf-text-light">Checking authentication...</p>
      </div>
    );
  }

  if (authChecked && cohorts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <CalendarClock size={40} className="mx-auto text-qosf-text-light mb-4" />
        <h1 className="text-2xl font-bold text-qosf-blue mb-2">No Open Cohorts</h1>
        <p className="text-qosf-text-light mb-6">
          There are no cohorts currently accepting applications.
          Check back later or contact the program administrators.
        </p>
        <Link href="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!role || (role !== "mentee" && role !== "mentor")) {
    router.push("/dashboard");
    return null;
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);

    if (!selectedCohort) {
      setError("No cohort selected. An admin must create a cohort first.");
      setSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Update the user's profile with application data
    const { error: profileErr } = await supabase.from("profiles").upsert({
      user_id: user.id,
      email: user.email,
      full_name: formData.full_name as string,
      role,
      bio: formData.bio as string,
      educational_level: formData.educational_level as string,
      research_interests: formData.research_interests as string[],
      keywords: (formData.keywords as string)?.split(",").map((k: string) => k.trim()).filter(Boolean),
      timezone: formData.timezone as string,
      linkedin_url: formData.linkedin_url as string,
      github_url: formData.github_url as string,
      status: "submitted",
    }, { onConflict: "user_id" });

    if (profileErr) {
      setError(profileErr.message);
      setSubmitting(false);
      return;
    }

    // 2. Create application record
    const { error: appErr } = await supabase.from("applications").insert({
      user_id: user.id,
      cohort_id: selectedCohort,
      role,
      form_data: formData,
      status: "submitted",
    });

    setSubmitting(false);

    if (appErr) {
      setError(appErr.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FileText size={48} className="mx-auto text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-qosf-blue mb-2">Application Submitted!</h1>
        <p className="text-qosf-text-light mb-6">
          Thank you for applying as a {role}. Our team will review your
          submission and get back to you.
        </p>
        <Link href="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue mb-2 capitalize">
        {role} Application
      </h1>
      <p className="text-qosf-text-light mb-8">
        Fill out the form below. All fields marked with * are required.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {cohorts.length > 0 && (
        <div className="card mb-6">
          <label className="block text-sm font-medium text-qosf-text mb-2">
            Select Cohort
          </label>
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-qosf-border rounded-lg"
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <SurveyForm
        json={role === "mentee" ? menteeSurveyJson : mentorSurveyJson}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
