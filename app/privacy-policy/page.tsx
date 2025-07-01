import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SipCoin",
  description:
    "Our commitment to protecting your privacy and personal data. Learn about how we collect, use, and protect your information in accordance with GDPR.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "user rights",
    "data security",
    "SipCoin",
  ],
  openGraph: {
    title: "Privacy Policy | SipCoin",
    description: "Our commitment to protecting your privacy and personal data",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>
      </nav>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white">
            Privacy Policy
          </CardTitle>
          <p className="text-zinc-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-8 text-zinc-300">
              <section aria-labelledby="introduction-heading">
                <h2
                  id="introduction-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Introduction
                </h2>
                <p>
                  At SipCoin, we take your privacy seriously. This Privacy
                  Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our service. Please read this
                  privacy policy carefully. If you do not agree with the terms
                  of this privacy policy, please do not access the service.
                </p>
              </section>

              <section aria-labelledby="information-collected-heading">
                <h2
                  id="information-collected-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Personal Information
                    </h3>
                    <ul className="list-disc pl-6 space-y-2" role="list">
                      <li>Name and contact information</li>
                      <li>Date of birth</li>
                      <li>Email address</li>
                      <li>Profile information</li>
                      <li>Location data (with your consent)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Usage Information
                    </h3>
                    <ul className="list-disc pl-6 space-y-2" role="list">
                      <li>Device information</li>
                      <li>IP address</li>
                      <li>Browser type</li>
                      <li>Operating system</li>
                      <li>Usage patterns</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section aria-labelledby="information-use-heading">
                <h2
                  id="information-use-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2" role="list">
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </section>

              <section aria-labelledby="gdpr-rights-heading">
                <h2
                  id="gdpr-rights-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Your Rights Under GDPR
                </h2>
                <div className="space-y-4">
                  <p>Under the GDPR, you have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2" role="list">
                    <li>Right to access your personal data</li>
                    <li>Right to rectification of inaccurate data</li>
                    <li>Right to erasure ("right to be forgotten")</li>
                    <li>Right to restrict processing</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                </div>
              </section>

              <section aria-labelledby="data-security-heading">
                <h2
                  id="data-security-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Data Security
                </h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal data against unauthorized or unlawful
                  processing, accidental loss, destruction, or damage. However,
                  no method of transmission over the Internet or electronic
                  storage is 100% secure.
                </p>
              </section>

              <section aria-labelledby="data-retention-heading">
                <h2
                  id="data-retention-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Data Retention
                </h2>
                <p>
                  We retain your personal data only for as long as necessary to
                  fulfill the purposes for which we collected it, including
                  legal, accounting, or reporting requirements. We review our
                  retention periods regularly to ensure we are not keeping your
                  data longer than necessary.
                </p>
              </section>

              <section aria-labelledby="contact-heading">
                <h2
                  id="contact-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at:
                </p>
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <p className="font-medium">SipCoin Support</p>
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:privacy@sipcoin.com"
                      className="text-purple-400 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
                    >
                      privacy@sipcoin.com
                    </a>
                  </p>
                  <p>Address: 123 Privacy Street, Security City, 12345</p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
