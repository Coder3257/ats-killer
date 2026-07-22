import React from "react";
import { ArrowLeft, Lock } from "lucide-react";

interface LegalPageProps {
  onNavigate: (path: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: LegalPageProps) {
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
            <Lock className="h-4 w-4" />
            Privacy Policy
          </div>
        </div>

        {/* Legal Text */}
        <div className="space-y-6 text-sm text-[#4E453F] leading-relaxed">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-[#1C1008] tracking-tight">Privacy Policy</h1>
            <p className="text-xs font-mono font-semibold text-[#8B7E74]">Last Updated: July 17, 2026</p>
          </div>

          <p>
            At <strong>ATS Killer</strong>, we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, process, share, and retain your data when you use our resume optimization Service operated by <strong>Ravi Mahto</strong> ( ravimahto712@gmail.com ).
          </p>

          <hr className="border-[#F5F0E8]" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">1. Data We Collect</h2>
            <p>
              To provide the resume optimization service, we collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Credentials:</strong> Your email address and login details are securely collected and processed by our authentication provider, <strong>Supabase Auth</strong>.</li>
              <li><strong>Resume and Job Data:</strong> The raw text, structures, and information contained within your uploaded resume and the target job description text you submit.</li>
              <li><strong>Payment Metadata:</strong> When you purchase credits, subscriptions, or lifetime access, the transaction is processed securely by <strong>Razorpay</strong>. We receive and store transaction metadata (e.g. payment status, order ID, plan type). We **do not** collect, store, or have access to your raw credit/debit card numbers or net banking credentials. All card data is handled directly by Razorpay in compliance with PCI-DSS standards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">2. How We Process and Share Your Data</h2>
            <p>
              Your data is processed and shared with trusted service providers strictly to perform core operations:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Gemini API (Google Cloud):</strong> To analyze keyword matches, calculate ATS scores, and rewrite resume bullets, your resume text and target job description are sent to Google’s Gemini API endpoints. Google Cloud processes this data to generate the analysis and does not use this data to train its foundational models.</li>
              <li><strong>Supabase (Database & Storage):</strong> Your profile details, score history, unlocked badges, and application progress are stored securely in Supabase hosted databases.</li>
              <li><strong>Razorpay:</strong> Handles checkout processing, payment capturing, and subscription state updates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">3. Cookies and Session Management</h2>
            <p>
              We do not run third-party advertising cookies or trackers. We only use essential functional cookies and local storage tokens (stored securely in your browser) to manage user login sessions (via Supabase authentication) and retain your dashboard view settings. Disabling these cookies will prevent you from signing in or accessing your premium workspace.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">4. Data Retention and Security</h2>
            <p>
              We retain your resume data, score history, and application logs in our secure database as long as you maintain an active account with us. This allows you to track your resume optimization score history and review challenges. We implement standard cryptographic encryption protocols (SSL/TLS) for all data in transit and configure Supabase Row Level Security (RLS) policies to ensure users can only view their own records.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">5. Your Data Rights</h2>
            <p>
              You have full control over your personal data. You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the score history and profile data we store.</li>
              <li>Request modification of your profile credentials.</li>
              <li>Request the complete deletion of your account and all associated resume analysis history from our databases.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please email us at <a href="mailto:ravimahto712@gmail.com" className="text-[#D97706] hover:underline">ravimahto712@gmail.com</a>. We will fulfill privacy requests within 30 days of verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1C1008]">6. Contact Information</h2>
            <p>
              If you have any questions or data deletion requests, please contact us at:
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
