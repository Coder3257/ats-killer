import React from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface LegalPageProps {
  onNavigate: (path: string) => void;
}

export default function RefundPolicy({ onNavigate }: LegalPageProps) {
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
            <RotateCcw className="h-4 w-4" />
            Refund Policy
          </div>
        </div>

        {/* Legal Text */}
        <div className="space-y-6 text-sm text-[#4E453F] leading-relaxed">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-[#1C1008] tracking-tight">Refund Policy</h1>
            <p className="text-xs font-mono font-semibold text-[#8B7E74]">Last Updated: July 17, 2026</p>
          </div>

          <p>
            Thank you for choosing <strong>ATS Killer</strong>. Since our Service utilizes real-time API integrations and cloud resources (Google Gemini API) to perform analysis, we adhere to the following refund terms.
          </p>

          <hr className="border-[#F5F0E8]" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">1. One-Time Credit Packs</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Credits are non-refundable once they have been consumed for a resume scan/analysis.</li>
              <li>If you purchase a bundle of credits, you are eligible to request a refund within **7 days** of the purchase date, provided that **zero credits** from that specific pack have been used. Partial refunds for partially consumed credit packs are not permitted.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">2. Pro Monthly Subscription Tiers</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Subscriptions grant unlimited access to the optimization dashboard. You can cancel your monthly subscription at any time through the billing dashboard.</li>
              <li>Upon cancellation, your Pro features will remain active until the end of your current billing period. No further auto-renewals will charge.</li>
              <li>We do not offer partial or prorated refunds for the active billing month once the renewal payment has gone through.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">3. Lifetime Plan Purchase</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>The Lifetime plan is a one-time payment for permanent unlimited access.</li>
              <li>You may request a full refund of a Lifetime purchase within **7 days** of the transaction, **only if** you have not performed any resume scans or analyses during that period. Once a scan has been executed, the transaction is considered finalized and non-refundable.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">4. How to Request a Refund</h2>
            <p>
              To request a refund, please send an email to our support inbox:
            </p>
            <p className="font-semibold text-[#1C1008] bg-[#FAF8F5] border border-[#E5E0D8] p-3 rounded-xl w-fit">
              Email: <a href="mailto:ravimahto712@gmail.com" className="text-[#D97706] hover:underline">ravimahto712@gmail.com</a>
            </p>
            <p className="mt-2">
              In your email, please include:
            </p>
            <ul className="list-decimal pl-5 space-y-1">
              <li>Your account email address.</li>
              <li>The Razorpay Payment ID or Order ID associated with the transaction.</li>
              <li>A brief explanation of why you are requesting a refund.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">5. Refund Processing Time</h2>
            <p>
              Once a refund request is approved, we will initiate the refund directly through Razorpay. Approved refunds are credited back to your original payment method (e.g. UPI, Net Banking, or Credit/Debit Card). Depending on banking institution cycles in India, funds typically reflect in your account within **5 to 7 business days**.
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
