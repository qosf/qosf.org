"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, TIMEZONES, PRONOUNS, ACADEMIC_DEGREES } from "@/lib/constants";
import { AlertCircle, Save } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [interestsStr, setInterestsStr] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!p) { setLoading(false); return; }

      setProfile(p);
      setFullName(p.full_name ?? "");
      setEmail(p.email ?? "");
      setCountry(p.country ?? "");
      setTimezone(p.timezone ?? "");
      setPronouns(p.pronouns ?? "");
      setAcademicDegree(p.academic_degree ?? "");
      setInstitution(p.institution ?? "");
      setBio(p.bio ?? "");
      setLinkedin(p.linkedin_url ?? "");
      setGithub(p.github_url ?? "");
      setInterestsStr((p.research_interests ?? []).join(", "));
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!profile) return;

    const interests = interestsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        country,
        timezone,
        pronouns,
        academic_degree: academicDegree,
        institution,
        bio,
        linkedin_url: linkedin,
        github_url: github,
        research_interests: interests,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-qosf-text-light">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-qosf-text-light">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-qosf-blue mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Full Name *</label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg" />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Email</label>
          <input type="email" value={email} readOnly
            className="w-full px-3 py-2 border border-qosf-border rounded-lg bg-gray-50 text-qosf-text-light cursor-not-allowed" />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Country *</label>
          <select required value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg">
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Timezone *</label>
          <select required value={timezone} onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg">
            <option value="">Select your timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Pronouns *</label>
          <select required value={pronouns} onChange={(e) => setPronouns(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg">
            <option value="">Select pronouns</option>
            {PRONOUNS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Academic Degree */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Academic Degree *</label>
          <select required value={academicDegree} onChange={(e) => setAcademicDegree(e.target.value)}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg">
            <option value="">Select your academic degree</option>
            {ACADEMIC_DEGREES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Institution */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Institution (Academic or Professional Affiliation) *</label>
          <input type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g., MIT, IBM, University of Oxford..."
            className="w-full px-3 py-2 border border-qosf-border rounded-lg" />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)}
            rows={3} maxLength={1000}
            className="w-full px-3 py-2 border border-qosf-border rounded-lg" />
        </div>

        {/* Research Interests */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">Research Interests (comma separated)</label>
          <input type="text" value={interestsStr} onChange={(e) => setInterestsStr(e.target.value)}
            placeholder="e.g., Quantum Algorithms, Quantum Machine Learning"
            className="w-full px-3 py-2 border border-qosf-border rounded-lg" />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">LinkedIn URL</label>
          <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="w-full px-3 py-2 border border-qosf-border rounded-lg" />
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-medium text-qosf-text mb-1">GitHub URL</label>
          <input type="url" value={github} onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-3 py-2 border border-qosf-border rounded-lg" />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
