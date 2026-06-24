import Link from "next/link";
import { ArrowRight, Users, ClipboardCheck, Calendar } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  let session = null;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data?.user) session = { user: data.user };
  }

  const applyHref = session ? "/dashboard" : "/signup";

  return (
    <>
      {/* Hero section */}
      <section className="hero-subheader">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="hero-subheader__title">
              Quantum Computing Mentorship Program
            </h1>
            <p className="hero-subheader__desc">
              Connecting quantum enthusiasts with mentors from academia &amp;
              industry. Join a global community of like-minded people and
              contribute to open-source quantum computing software.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={applyHref} className="btn-primary">
                Apply as Mentee <ArrowRight size={18} />
              </Link>
              <Link href={applyHref} className="btn-outline !border-white !text-white hover:!bg-white hover:!text-qosf-blue">
                Apply as Mentor <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10 max-w-5xl mx-auto">
            <div className="card text-center">
              <div className="w-14 h-14 bg-qosf-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="text-qosf-blue" size={28} />
              </div>
              <h3 className="text-xl font-bold text-qosf-blue mb-2">
                1. Apply
              </h3>
              <p className="text-qosf-text-light text-sm">
                Fill in your application form. Tell us about your background,
                interests, and what you hope to achieve.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-qosf-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-qosf-accent" size={28} />
              </div>
              <h3 className="text-xl font-bold text-qosf-blue mb-2">
                2. Get Matched
              </h3>
              <p className="text-qosf-text-light text-sm">
                Our system helps find the ideal mentor-mentee pair based on
                research interests, expertise, and timezone.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-qosf-blue mb-2">
                3. Collaborate
              </h3>
              <p className="text-qosf-text-light text-sm">
                Work together on open-source quantum computing projects with
                timelines, milestones, and community support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-qosf-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title">Ready to Get Started?</h2>
          <p className="text-qosf-text-light max-w-2xl mx-auto mb-8">
            Whether you&apos;re looking to deepen your quantum computing knowledge
            or share your expertise as a mentor, our program offers a structured
            path to contribute to the open-source quantum ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/about" className="btn-secondary">
              Learn More
            </Link>
            <Link href={session ? "/dashboard" : "/login"} className="btn-outline">
              {session ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
