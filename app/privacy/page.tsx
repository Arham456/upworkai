import Link from "next/link";
import { HawkLogo } from "@/components/hawk-logo";

export const metadata = {
  title: "Privacy Policy — RefinedHawk",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-10 py-4 border-b border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <HawkLogo size={32} />
          <span className="font-bold text-white tracking-tight">RefinedHawk</span>
        </Link>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
        <div className="space-y-3 mb-12">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: June 9, 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Overview</h2>
            <p>
              RefinedHawk (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an individual-operated SaaS product. This
              Privacy Policy explains what data we collect, how we use it, and your rights regarding
              your personal information when you use RefinedHawk.
            </p>
            <p>
              By using RefinedHawk, you agree to the collection and use of information in accordance
              with this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p>
              We collect the minimum data necessary to provide the service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>
                <span className="text-zinc-300 font-medium">Google OAuth data</span> — when you sign
                in with Google, we receive your name, email address, and profile picture from Google.
                We do not receive your Google password or access to your Google account beyond
                authentication.
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Profile data</span> — freelancer profile
                information you enter manually, such as skills, experience, and writing samples used
                to personalize proposals.
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Proposal data</span> — job descriptions
                you analyze and proposals you generate or save within the platform.
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Usage data</span> — basic logs including
                which features you use and when, for improving the product and diagnosing bugs.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>To authenticate your account and maintain your session</li>
              <li>To generate AI-powered job analyses and proposals tailored to your voice</li>
              <li>To store and retrieve your proposals and profile data</li>
              <li>To process subscription payments via Polar</li>
              <li>To send transactional emails (e.g. receipts, critical service notifications)</li>
              <li>To improve the product based on aggregate usage patterns</li>
            </ul>
            <p>
              We do not sell your personal data to third parties. We do not use your data for
              advertising.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Payments</h2>
            <p>
              Subscription payments ($20/month) are processed by{" "}
              <span className="text-zinc-200 font-medium">Polar</span>, a third-party payment
              processor. We do not store your credit card number or payment details on our servers.
              Polar&apos;s use of your payment data is governed by their own privacy policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Data Storage & Security</h2>
            <p>
              Your data is stored on secured servers. We use industry-standard practices to protect
              your information, including encrypted connections (HTTPS) and access controls. However,
              no method of transmission over the Internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
            <p>
              We retain your data for as long as your account is active. If you delete your account,
              we will delete your personal data within 30 days, except where retention is required by
              law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Third-Party Services</h2>
            <p>We use the following third-party services that may process your data:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>
                <span className="text-zinc-300 font-medium">Google OAuth</span> — for sign-in
                authentication
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Polar</span> — for payment processing
              </li>
              <li>
                <span className="text-zinc-300 font-medium">AI model providers</span> — job
                descriptions and profile data may be sent to AI APIs to generate analyses and
                proposals. These providers operate under strict data processing agreements.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your proposal and profile data</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:arham.k5299@gmail.com"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
              >
                arham.k5299@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">8. Cookies</h2>
            <p>
              We use only essential cookies required for session management and authentication. We do
              not use tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. If we make significant changes, we will
              notify you by email or by posting a notice on the app. Continued use of RefinedHawk
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:arham.k5299@gmail.com"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
              >
                arham.k5299@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-800/60 py-8 px-4 sm:px-10 mt-16">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HawkLogo size={20} />
            <span className="text-sm font-medium text-zinc-500">RefinedHawk</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-zinc-400 transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
