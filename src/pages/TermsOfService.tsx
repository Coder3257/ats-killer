import React from "react";
import { ArrowLeft, Shield } from "lucide-react";

interface LegalPageProps {
  onNavigate: (path: string) => void;
}

export default function TermsOfService({ onNavigate }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1008] font-sans antialiased selection:bg-[#D97706]/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-[#F5F0E8] pb-6">
          <button 
            onClick={() => onNavigate("/")} 
            className="flex items-center gap-2 text-xs font-bold text-[#1C1008]/70 hover:text-[#D97706] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#D97706]">
            <Shield className="h-4 w-4" />
            Terms of Service
          </div>
        </div>

        {/* Legal Text */}
        <div className="space-y-6 text-sm text-[#4E453F] leading-relaxed">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-[#1C1008] tracking-tight">Terms of Service</h1>
            <p className="text-xs font-mono font-semibold text-[#8B7E74]">Last Updated: July 17, 2026</p>
          </div>

          <p>
            Welcome to <strong>ATS Killer</strong>. These Terms of Service ("Terms") govern your use of the ATS Killer web application, services, and related tools (collectively, the "Service"). The Service is operated by <strong>Ravi Mahto</strong> ("Operator", "we", "us", or "our") as an individual/sole proprietor in India.
          </p>
          <p>
            By creating an account, making a purchase, or using any part of the Service, you agree to be bound by these Terms. If you do not agree, please do not access or use the Service.
          </p>

          <hr className="border-[#F5F0E8]" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">1. Service Description</h2>
            <p>
              ATS Killer is an AI-powered resume analysis and optimization platform. It utilizes the AI analysis API to scan resumes against target job descriptions, provide matching scores, identify skill gaps, and suggest optimizations to align your resume with Applicant Tracking Systems (ATS).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">2. Eligibility and User Accounts</h2>
            <p>
              You must be at least 18 years old (or the legal age of majority in your jurisdiction) to use our Service. By registering an account (powered by Supabase Authentication), you agree to provide accurate, complete, and current credentials. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">3. Acceptable Use Policy</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload or submit resumes, job descriptions, or data that violate any third-party copyright, privacy, or proprietary rights.</li>
              <li>Attempt to reverse-engineer, exploit, scrape, or interfere with the API endpoints, backend operations, or databases of the Service.</li>
              <li>Exceed local rate limits or query limits in a malicious attempt to cause service disruption or denial of service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">4. Payment Terms, Subscriptions, and Credits</h2>
            <p>
              All payments are processed securely in INR (Indian Rupees) via our payment gateway partner, <strong>Razorpay</strong>. We offer three primary billing schemes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>One-Time Credits:</strong> Purchased credits are consumed at a rate of 1 credit per resume scan/analysis. Credits have no cash value and are subject to the Refund Policy.</li>
              <li><strong>Pro Plan (Monthly Subscription):</strong> Billed monthly. Grants unlimited resume analyses while active. Subscriptions auto-renew unless cancelled through the dashboard billing settings before the next renewal date.</li>
              <li><strong>Lifetime Tier:</strong> A one-time purchase granting permanent, unlimited access to resume analyses for the lifetime of the product.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#FAF8F5] border border-[#E5E0D8] p-4 rounded-2xl">
            <h2 className="text-sm font-bold text-[#1C1008] uppercase tracking-wider font-mono text-[#D97706]">Disclaimer & No Guarantee of Job Outcomes</h2>
            <p className="text-xs leading-relaxed mt-1">
              <strong>IMPORTANT:</strong> ATS Killer is an optimization tool designed to assist in format, keyword, and structure tuning. The Service does NOT guarantee job interviews, job offers, or salary increases. Job placement depends on external factors beyond our control, including hiring market conditions, candidate experience, employer criteria, and interview performance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall Ravi Mahto, the Operator, be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or employment opportunities arising out of or related to your use of the Service. Our total liability for any claim hereunder is limited to the amount paid by you to the Service in the 12 months preceding the event.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without prior notice, if we believe you have breached these Terms, violated acceptable use policies, or engaged in fraudulent activity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">7. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>, without regard to conflict of law principles. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">8. Contact Information</h2>
            <p>
              If you have any questions, feedback, or concerns regarding these Terms, please contact support at:
            </p>
            <p className="font-semibold text-[#1C1008]">
              Email: <a href="mailto:ravimahto712@gmail.com" className="text-[#D97706] hover:underline">ravimahto712@gmail.com</a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-[#F5F0E8] pt-6 flex justify-center">
          <button 
            onClick={() => onNavigate("/")} 
            className="px-6 py-2.5 bg-[#1C1008] text-white text-xs font-bold rounded-2xl hover:bg-stone-900 transition-colors cursor-pointer shadow-sm"
          >
            Acknowledge & Return Home
          </button>
        </div>

      </div>
    </div>
  );
}
