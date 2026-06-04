"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCheck, Calendar, GitCompare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/mentors", label: "Mentors", icon: Users },
  { href: "/admin/mentees", label: "Mentees", icon: UserCheck },
  { href: "/admin/cohorts", label: "Cohorts", icon: Calendar },
  { href: "/admin/matches", label: "Matches", icon: GitCompare },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 space-y-1">
      <div className="flex items-center gap-2 text-qosf-blue font-bold mb-4 text-sm">
        <Shield size={18} />
        Admin Panel
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-qosf-blue text-white"
                : "text-qosf-text hover:bg-qosf-blue/5",
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}