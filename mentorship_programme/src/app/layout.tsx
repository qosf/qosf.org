import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "QOSF Mentorship Programme",
  description:
    "Manage the application process and smooth execution of the Quantum Open Source Foundation mentorship program cohorts.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data?.user) session = { user: { email: data.user.email } };
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&family=Noto+Sans:wght@400;400i;700;700i&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
