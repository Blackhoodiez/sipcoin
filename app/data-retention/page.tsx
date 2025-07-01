import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Retention Policy | SipCoin",
  description:
    "Learn about how we handle and retain your data in accordance with GDPR and other applicable regulations.",
  keywords: [
    "data retention",
    "data protection",
    "GDPR",
    "data storage",
    "data deletion",
    "SipCoin",
  ],
  openGraph: {
    title: "Data Retention Policy | SipCoin",
    description: "Learn about how we handle and retain your data",
    type: "website",
  },
};

export default function DataRetentionPage() {
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
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
            Data Retention Policy
          </CardTitle>
          <p className="text-sm sm:text-base text-zinc-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-8 text-zinc-300">
              <section
                aria-labelledby="introduction-heading"
                className="space-y-4"
              >
                <h2
                  id="introduction-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Introduction
                </h2>
                <p className="text-sm sm:text-base">
                  This Data Retention Policy outlines how SipCoin manages and
                  retains your personal data. We are committed to ensuring that
                  your data is handled securely and in compliance with
                  applicable data protection laws, including the General Data
                  Protection Regulation (GDPR).
                </p>
              </section>

              <section
                aria-labelledby="retention-periods-heading"
                className="space-y-4"
              >
                <h2
                  id="retention-periods-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Data Retention Periods
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-medium text-white">
                      Account Data
                    </h3>
                    <ul
                      className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                      role="list"
                    >
                      <li>Active accounts: Retained until account deletion</li>
                      <li>
                        Inactive accounts: Deleted after 12 months of inactivity
                      </li>
                      <li>
                        Account deletion requests: Processed within 30 days
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-medium text-white">
                      Transaction Data
                    </h3>
                    <ul
                      className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                      role="list"
                    >
                      <li>
                        Financial records: Retained for 7 years (legal
                        requirement)
                      </li>
                      <li>Transaction history: Available for 5 years</li>
                      <li>
                        Payment information: Securely stored until account
                        deletion
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-medium text-white">
                      Communication Data
                    </h3>
                    <ul
                      className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                      role="list"
                    >
                      <li>Support tickets: Retained for 2 years</li>
                      <li>Email communications: Retained for 2 years</li>
                      <li>Chat logs: Deleted after 90 days</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section
                aria-labelledby="data-categories-heading"
                className="space-y-4"
              >
                <h2
                  id="data-categories-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Data Categories and Retention
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-medium text-white">
                      Personal Information
                    </h3>
                    <ul
                      className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                      role="list"
                    >
                      <li>Name and contact details: Until account deletion</li>
                      <li>Profile information: Until account deletion</li>
                      <li>Preferences and settings: Until account deletion</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-medium text-white">
                      Usage Data
                    </h3>
                    <ul
                      className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                      role="list"
                    >
                      <li>Activity logs: 12 months</li>
                      <li>Analytics data: 24 months</li>
                      <li>Device information: Until account deletion</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section
                aria-labelledby="deletion-process-heading"
                className="space-y-4"
              >
                <h2
                  id="deletion-process-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Data Deletion Process
                </h2>
                <p className="text-sm sm:text-base">
                  When you request account deletion or when data reaches its
                  retention period, we follow a comprehensive deletion process:
                </p>
                <ul
                  className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                  role="list"
                >
                  <li>Immediate deactivation of account access</li>
                  <li>Removal of personal data from active systems</li>
                  <li>Secure deletion of stored data</li>
                  <li>Removal of data from backups within 30 days</li>
                  <li>Confirmation of deletion sent to user</li>
                </ul>
              </section>

              <section
                aria-labelledby="backup-retention-heading"
                className="space-y-4"
              >
                <h2
                  id="backup-retention-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Backup Retention
                </h2>
                <p className="text-sm sm:text-base">
                  We maintain secure backups of our systems for disaster
                  recovery purposes. These backups are:
                </p>
                <ul
                  className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                  role="list"
                >
                  <li>Encrypted and securely stored</li>
                  <li>Retained for 30 days</li>
                  <li>Automatically purged after retention period</li>
                  <li>Subject to the same security measures as active data</li>
                </ul>
              </section>

              <section
                aria-labelledby="legal-requirements-heading"
                className="space-y-4"
              >
                <h2
                  id="legal-requirements-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Legal Requirements
                </h2>
                <p className="text-sm sm:text-base">
                  We may be required to retain certain data for longer periods
                  to comply with legal obligations:
                </p>
                <ul
                  className="list-disc pl-6 space-y-2 text-sm sm:text-base"
                  role="list"
                >
                  <li>Financial records for tax purposes</li>
                  <li>Transaction data for regulatory compliance</li>
                  <li>Records required for legal proceedings</li>
                  <li>Data necessary for fraud prevention</li>
                </ul>
              </section>

              <section aria-labelledby="contact-heading" className="space-y-4">
                <h2
                  id="contact-heading"
                  className="text-xl sm:text-2xl font-semibold text-white"
                >
                  Contact Us
                </h2>
                <p className="text-sm sm:text-base">
                  If you have any questions about our data retention practices,
                  please contact us at:
                </p>
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg space-y-2">
                  <p className="font-medium text-sm sm:text-base">
                    SipCoin Data Protection Officer
                  </p>
                  <p className="text-sm sm:text-base">
                    Email:{" "}
                    <a
                      href="mailto:privacy@sipcoin.com"
                      className="text-purple-400 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
                    >
                      privacy@sipcoin.com
                    </a>
                  </p>
                  <p className="text-sm sm:text-base">
                    Address: 123 Privacy Street, Security City, 12345
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
