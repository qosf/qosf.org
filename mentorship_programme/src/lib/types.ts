export type Role = "mentee" | "mentor" | "admin";

export type ApplicationStatus = "draft" | "submitted" | "approved" | "rejected";

export type MatchStatus = "pending" | "accepted" | "rejected" | "completed";

export type SubmissionStatus = "draft" | "submitted" | "banned" | "winner";

export interface Profile {
  id: string;
  user_id: string;
  role: Role;
  full_name: string;
  email: string;
  bio?: string;
  educational_level?: string;
  research_interests?: string[];
  keywords?: string[];
  timezone?: string;
  linkedin_url?: string;
  github_url?: string;
  status: ApplicationStatus;
  country?: string;
  pronouns?: string;
  academic_degree?: string;
  institution?: string;
  terms_accepted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  application_start: string;
  application_end: string;
  mentorship_start: string;
  mentorship_end: string;
  status: "upcoming" | "open" | "active" | "completed";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  cohort_id: string;
  role: Role;
  form_data: Record<string, unknown>;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  cohort_id: string;
  mentor_id: string;
  mentee_id: string;
  status: MatchStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  mentor?: Profile;
  mentee?: Profile;
}

export interface Submission {
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
  status: SubmissionStatus;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
  // joined from other tables
  profile?: Profile;
  cohort?: Cohort;
}

export interface TimelineEvent {
  id: string;
  cohort_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: "deadline" | "milestone" | "meeting" | "other";
  created_at: string;
}
