import Link from "next/link";
import { HawkLogo } from "@/components/hawk-logo";

export const metadata = {
  title: "Terms of Service — RefinedHawk",
};

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: June 9, 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using RefinedHawk, you agree to be bound by these Terms of
              Service. If you do not agree to these terms, do not use the service.
            </p>
            <p>
              RefinedHawk is operated by an individual. These terms constitute the entire agreement
              between you and RefinedHawk regarding your use of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
            <p>
              RefinedHawk is a SaaS tool designed to help freelancers on Upwork analyze job postings,
              detect client red flags, generate personalized proposals, and track proposal outcomes.
              Features include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>AI-powered job analysis and client psychology insights</li>
              <li>Client red flag detection (available on all plans)</li>
              <li>Personalized proposal generation (Pro plan)</li>
              <li>Win/loss tracking and learning insights</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any feature of the service at
              any time with reasonable notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Account Registration</h2>
            <p>
              You must sign in with a valid Google account to use RefinedHawk. You are responsible for
              maintaining the security of your account and for all activities that occur under it. You
              agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              You must be at least 16 years old to use this service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Subscription & Payments</h2>
            <p>
              RefinedHawk offers a free tier and a Pro subscription at{" "}
              <span className="text-white font-semibold">$20 per month</span>. Payments are processed
              securely by <span className="text-zinc-200 font-medium">Polar</span>.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>
                Subscriptions renew automatically at the end of each billing period unless cancelled.
              </li>
              <li>
                You may cancel your subscription at any time. Cancellation takes effect at the end of
                your current billing period — you retain Pro access until then.
              </li>
              <li>
                We do not offer refunds for partial billing periods, unless required by applicable law.
              </li>
              <li>
                We reserve the right to change pricing with at least 30 days&apos; advance notice.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>Use the service for any unlawful purpose or in violation of Upwork&apos;s own terms</li>
              <li>Resell, sublicense, or commercially redistribute access to RefinedHawk</li>
              <li>Attempt to reverse-engineer, scrape, or automate the platform</li>
              <li>Abuse or attempt to circumvent usage limits or plan restrictions</li>
              <li>Submit content that is fraudulent, defamatory, or infringes third-party rights</li>
              <li>
                Use the AI-generated proposals to misrepresent your skills or experience to clients
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Intellectual Property</h2>
            <p>
              The RefinedHawk platform, its branding, and underlying technology are owned by us. You
              retain full ownership of the content you input (job descriptions, profile data, writing
              samples) and the proposals generated for your use.
            </p>
            <p>
              You grant us a limited license to process your content solely to provide the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">7. AI-Generated Content</h2>
            <p>
              Proposals and analyses generated by RefinedHawk are produced by AI and provided as
              suggestions only. You are solely responsible for reviewing, editing, and deciding
              whether to use any AI-generated content. We make no guarantees that AI output will
              result in job wins or client responses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">8. Disclaimer of Warranties</h2>
            <p>
              RefinedHawk is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              express or implied. We do not guarantee uninterrupted service, error-free operation, or
              any specific outcome from using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, RefinedHawk shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including loss of
              profits or revenue, arising out of your use of the service. Our total liability to you
              for any claims arising from these terms shall not exceed the amount you paid us in the
              three months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">10. Termination</h2>
            <p>
              You may close your account at any time by contacting us. We reserve the right to
              suspend or terminate your account if you violate these Terms, with or without notice
              depending on severity.
            </p>
            <p>
              Upon termination, your access to the service ends and your data will be deleted in
              accordance with our{" "}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Significant changes will be communicated
              via email or in-app notice. Continued use of RefinedHawk after changes are posted
              constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">12. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{" "}
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
