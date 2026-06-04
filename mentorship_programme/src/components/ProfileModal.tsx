import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

interface ProfileModalProps {
  profile: Profile;
  onClose: () => void;
}

export default function ProfileModal({ profile, onClose }: ProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-qosf-blue">{profile.full_name}</h2>
            <p className="text-sm text-qosf-text-light capitalize">{profile.role}</p>
          </div>
          <button onClick={onClose} className="text-qosf-text-light hover:text-qosf-text">
            <X size={20} />
          </button>
        </div>

        {/* Details */}
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-qosf-text-light w-1/3">Email</dt>
            <dd className="font-medium w-2/3 text-right">{profile.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-qosf-text-light w-1/3">Status</dt>
            <dd className="font-medium w-2/3 text-right capitalize">{profile.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-qosf-text-light w-1/3">Timezone</dt>
            <dd className="font-medium w-2/3 text-right">{profile.timezone ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-qosf-text-light w-1/3">Education</dt>
            <dd className="font-medium w-2/3 text-right">{profile.educational_level ?? "—"}</dd>
          </div>
          {profile.linkedin_url && (
            <div className="flex justify-between">
              <dt className="text-qosf-text-light w-1/3">LinkedIn</dt>
              <dd className="w-2/3 text-right">
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-qosf-blue hover:underline truncate block">
                  {profile.linkedin_url.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          )}
          {profile.github_url && (
            <div className="flex justify-between">
              <dt className="text-qosf-text-light w-1/3">GitHub</dt>
              <dd className="w-2/3 text-right">
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="text-qosf-blue hover:underline truncate block">
                  {profile.github_url.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* Interests */}
        {profile.research_interests && profile.research_interests.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-qosf-text-light mb-2">Research Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.research_interests.map((i) => (
                <span key={i} className="bg-qosf-blue/10 text-qosf-blue text-xs px-2.5 py-0.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4">
            <p className="text-xs text-qosf-text-light mb-1">Bio</p>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Public profile link */}
        <div className="mt-6 pt-4 border-t border-qosf-border">
          <Link href={`/profile/${profile.id}`} target="_blank"
            className="text-sm text-qosf-blue hover:underline inline-flex items-center gap-1">
            <ExternalLink size={14} /> View public profile
          </Link>
        </div>
      </div>
    </div>
  );
}
