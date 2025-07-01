import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | SipCoin",
  description:
    "Learn about how SipCoin uses cookies and similar technologies to enhance your experience.",
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Cookie Policy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">What Are Cookies</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Cookies are small text files that are placed on your device
                  when you visit our website. They help us provide you with a
                  better experience by enabling certain features and
                  functionality. Cookies can be "persistent" or "session"
                  cookies. Persistent cookies remain on your device when you go
                  offline, while session cookies are deleted as soon as you
                  close your web browser.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  How We Use Cookies
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  We use cookies for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>
                    <strong>Necessary Cookies:</strong> These cookies are
                    essential for the website to function properly. They enable
                    basic functions like page navigation and access to secure
                    areas of the website.
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> We use these cookies to
                    understand how visitors interact with our website. They help
                    us improve our services by collecting and reporting
                    information anonymously.
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> These cookies are used
                    to track visitors across websites. The intention is to
                    display ads that are relevant and engaging for the
                    individual user.
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> These cookies enable
                    the website to remember information that changes the way the
                    website behaves or looks, like your preferred language or
                    the region you are in.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Cookie Duration</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  The cookies we use have different lifespans:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>
                    Session cookies are temporary and expire when you close your
                    browser
                  </li>
                  <li>
                    Persistent cookies remain on your device for a specified
                    period or until you delete them
                  </li>
                  <li>Analytics cookies typically last for 90 days</li>
                  <li>Marketing cookies may last up to 1 year</li>
                  <li>Preference cookies are stored for 1 year</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Managing Cookies</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  You can control and/or delete cookies as you wish. You can
                  delete all cookies that are already on your computer and you
                  can set most browsers to prevent them from being placed. If
                  you do this, however, you may have to manually adjust some
                  preferences every time you visit our website and some services
                  and functionalities may not work.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  To manage your cookie preferences, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground mt-4">
                  <li>
                    Use our cookie consent banner to manage your preferences
                  </li>
                  <li>
                    Adjust your browser settings to block or delete cookies
                  </li>
                  <li>Use browser extensions to manage cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Third-Party Cookies
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Some cookies are placed by third-party services that appear on
                  our pages. We use the following third-party services:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>Google Analytics for website analytics</li>
                  <li>Stripe for payment processing</li>
                  <li>Cloudflare for security and performance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Updates to This Policy
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons. The date at the top of this policy
                  indicates when it was last updated.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  If you have any questions about our Cookie Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:privacy@sipcoin.com"
                    className="text-primary hover:underline"
                  >
                    privacy@sipcoin.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
