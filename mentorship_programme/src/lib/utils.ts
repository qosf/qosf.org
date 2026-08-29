// Merge class names (shadcn-style utility)
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// Format date for display
export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Check if a cohort is currently accepting applications
export function isApplicationOpen(cohort: { application_start: string; application_end: string }) {
  const now = new Date();
  return now >= new Date(cohort.application_start) && now <= new Date(cohort.application_end);
}

// Get cohort status label
export function getCohortStatusLabel(status: string) {
  const labels: Record<string, string> = {
    upcoming: "Upcoming",
    open: "Applications Open",
    active: "In Progress",
    completed: "Completed",
  };
  return labels[status] ?? status;
}

// Get status color classes
export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-800",
    open: "bg-green-100 text-green-800",
    active: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-600",
    submitted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}
