import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is an Applicant Tracking System (ATS) and how does it grade resumes?",
    answer: "An Applicant Tracking System (ATS) is software used by employers to collect, scan, and organize job applications. It looks for specific keywords, job titles, and experiences in your resume that match the job description. If your resume lacks high-priority terms or suffers from complex visual formats, it is automatically discarded, regardless of your human talent."
  },
  {
    question: "How does the AI Resume Rewriter weave in keywords?",
    answer: "Our engine uses advanced proprietary AI models to scan your raw bullets and compare them against the job description. It identifies where critical keywords are missing and rewrites those exact sentences to logically weave them in. It maintains professional action-oriented language with quantifiable metrics, avoiding spammy keyword stuffing."
  },
  {
    question: "Is my personal data secure and private?",
    answer: "Absolutely. We believe in strict user privacy. Your resume content is never stored on our servers, nor is it sold or used to train public machine learning models. Everything is analyzed securely in real-time, conforming to modern GDPR and data confidentiality principles."
  },
  {
    question: "Can I copy and paste custom job descriptions?",
    answer: "Yes, on our Pro plan, you can simply paste the exact URL or the text of any job posting. The analyzer instantly extracts the required terms and configures the diagnostic scorecard customized for that unique role."
  },
  {
    question: "Are your pricing plans billed in Indian Rupees (INR)?",
    answer: "Yes, our plans are specifically localized for India. Pro is available at just ₹299/month, and our popular Lifetime plan is a one-time charge of only ₹999. There are no hidden fees or conversion surcharges."
  },
  {
    question: "Can I download my optimized resume as a PDF?",
    answer: "Yes. Once you review and accept the suggestions in your dashboard, you can download your tailored resume in our standardized, battle-tested PDF template. Our templates are guaranteed to be 100% readable by all major enterprise ATS platforms (Workday, Taleo, Greenhouse, etc.)."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#FAF8F5] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-14 space-y-3">
          <HelpCircle className="h-8 w-8 text-[#D97706] mx-auto stroke-[1.5]" />
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-[#1C1008]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#1C1008]/70">
            Everything you need to know about beating the automated recruiters.
          </p>
        </div>

        {/* Collapsible Accordion items */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#F5F0E8] border border-[#EBE3D5] rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between text-base font-bold text-[#1C1008] hover:text-[#D97706] transition-all cursor-pointer"
                >
                  <span className="pr-4">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-[#D97706]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#1C1008]/50" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-[#1C1008]/85 font-medium leading-relaxed border-t border-[#E5DEC9]/40 pt-4 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
