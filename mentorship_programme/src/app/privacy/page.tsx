import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue mb-8">Privacy Policy</h1>
      <MarkdownRenderer content={`
## Privacy Policy

Last updated: June 3, 2026

The Quantum Open Source Foundation (QOSF) is committed to protecting your
privacy. This policy describes how we collect, use, and safeguard your
personal information.

### Information We Collect

We collect the following types of information:

- **Account Information**: Name, email address, and password
- **Profile Information**: Educational background, research interests,
  timezone, LinkedIn/GitHub URLs, and biography
- **Application Data**: Responses to application forms and surveys
- **Usage Data**: Page visits and interaction with the platform

### How We Use Your Information

Your information is used for:

- Processing applications for the mentorship program
- Facilitating mentor-mentee matching
- Communicating with you about program updates
- Improving the platform experience
- Generating anonymized program statistics

### Data Storage and Security

All data is stored securely in a database with encryption at rest and in
transit. Access to personal data is restricted to authorized personnel only.

### Data Sharing

We do not share your personal information with third parties except:

- With your explicit consent
- As required by law
- To protect the rights and safety of QOSF and its community

### Your Rights

You have the right to:

- Access your personal data
- Correct inaccurate data
- Delete your account and associated data
- Export your data in a portable format

### Contact

For privacy-related inquiries, contact us at
[privacy@qosf.org](mailto:privacy@qosf.org).
      `} />
    </div>
  );
}