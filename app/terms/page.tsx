import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SipCoin",
  description:
    "Terms and conditions for using SipCoin. Learn about your rights, responsibilities, and our service policies.",
  keywords: [
    "terms of service",
    "user agreement",
    "service terms",
    "legal terms",
    "SipCoin",
  ],
  openGraph: {
    title: "Terms of Service | SipCoin",
    description: "Terms and conditions for using SipCoin",
    type: "website",
  },
};

export default function TermsPage() {
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
            Terms of Service
          </CardTitle>
          <p className="text-zinc-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-8 text-zinc-300">
              <section aria-labelledby="acceptance-heading">
                <h2
                  id="acceptance-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing and using SipCoin, you agree to be bound by these
                  Terms of Service and all applicable laws and regulations. If
                  you do not agree with any of these terms, you are prohibited
                  from using or accessing this service.
                </p>
              </section>

              <section aria-labelledby="license-heading">
                <h2
                  id="license-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  2. Use License
                </h2>
                <p>
                  Permission is granted to temporarily use SipCoin for personal,
                  non-commercial purposes. This is the grant of a license, not a
                  transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2" role="list">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or other proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </section>

              <section aria-labelledby="account-heading">
                <h2
                  id="account-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  3. User Account
                </h2>
                <p>
                  To use certain features of SipCoin, you must register for an
                  account. You agree to provide accurate and complete
                  information during registration and to keep your account
                  information updated.
                </p>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-medium text-white">
                    Account Responsibilities:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2" role="list">
                    <li>Maintain the security of your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>
                      Accept responsibility for all activities under your
                      account
                    </li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <section aria-labelledby="conduct-heading">
                <h2
                  id="conduct-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  4. User Conduct
                </h2>
                <p>You agree not to engage in any activity that:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2" role="list">
                  <li>Violates any applicable laws or regulations</li>
                  <li>Infringes on the rights of others</li>
                  <li>Interferes with the proper functioning of the service</li>
                  <li>Attempts to gain unauthorized access</li>
                  <li>Harasses, abuses, or harms others</li>
                </ul>
              </section>

              <section aria-labelledby="ip-heading">
                <h2
                  id="ip-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  5. Intellectual Property
                </h2>
                <p>
                  The content, organization, graphics, design, and other matters
                  related to SipCoin are protected by applicable copyrights,
                  trademarks, and other proprietary rights. Copying,
                  redistributing, or reproducing any part of SipCoin is
                  prohibited without prior written consent.
                </p>
              </section>

              <section aria-labelledby="liability-heading">
                <h2
                  id="liability-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  6. Limitation of Liability
                </h2>
                <p>
                  SipCoin shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages resulting from
                  your use of or inability to use the service.
                </p>
              </section>

              <section aria-labelledby="changes-heading">
                <h2
                  id="changes-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  7. Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify these terms at any time. We
                  will notify users of any material changes by posting the new
                  Terms of Service on this page and updating the &quot;Last
                  updated&quot; date.
                </p>
              </section>

              <section aria-labelledby="contact-heading">
                <h2
                  id="contact-heading"
                  className="text-2xl font-semibold text-white mb-4"
                >
                  8. Contact Information
                </h2>
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us at:
                </p>
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <p className="font-medium">SipCoin Support</p>
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:legal@sipcoin.com"
                      className="text-purple-400 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
                    >
                      legal@sipcoin.com
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
