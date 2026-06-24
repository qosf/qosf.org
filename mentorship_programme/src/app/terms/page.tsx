import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue mb-8">Terms &amp; Conditions</h1>
      <MarkdownRenderer content={`
## Terms of Service

By using the QOSF Mentorship Programme platform, you agree to the following
terms and conditions.

### Acceptance of Terms

By accessing and using this platform, you accept and agree to be bound by the
terms and conditions set forth herein.

### User Responsibilities

- You must provide accurate and complete information when applying
- You are responsible for maintaining the confidentiality of your account
- You agree not to misuse the platform for any unlawful purpose
- You must respect the intellectual property rights of others

### Code of Conduct

All participants are expected to adhere to a professional code of conduct:

- Treat all participants with respect and dignity
- Provide constructive feedback
- Maintain confidentiality of shared information
- Comply with all applicable laws and regulations

### Intellectual Property

Projects created during the mentorship program are expected to be
open-source. Specific licensing terms should be agreed upon between
mentors and mentees at the start of each project.

### Limitation of Liability

QOSF provides this platform as-is and makes no warranties regarding the
availability, accuracy, or reliability of the service.

### Termination

QOSF reserves the right to terminate or suspend access to the platform
for violations of these terms.

### Changes to Terms

We may update these terms from time to time. Users will be notified of
material changes.
      `} />
    </div>
  );
}