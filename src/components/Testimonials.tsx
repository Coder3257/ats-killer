import { Star, TrendingUp, Sparkles } from "lucide-react";
import { TESTIMONIALS } from "../data/templates";

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#FAF8F5] relative border-b border-[#F5F0E8]">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#D97706]/5 blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase">
            Proof in numbers
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#1C1008]">
            Land more interviews. Fast.
          </h2>
          <p className="text-sm text-[#1C1008]/70 font-medium">
            Read how other proactive candidates rewrote their career trajectory using ATS Killer.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#F5F0E8] border border-[#EBE3D5] rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group"
            >
              
              {/* Highlight Metric Badge */}
              <div className="absolute -top-3.5 right-6 bg-[#10B981] text-[#FAF8F5] text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{testimonial.improvement}</span>
              </div>

              <div className="space-y-4">
                {/* Star rating */}
                <div className="flex gap-0.5 text-[#D97706]">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current stroke-[2.5]" />
                  ))}
                </div>

                {/* Testimonial review quote */}
                <p className="text-xs sm:text-sm text-[#1C1008]/80 leading-relaxed font-medium italic">
                  "{testimonial.text}"
                </p>
              </div>

              {/* User details footer block */}
              <div className="flex items-center gap-3.5 pt-6 border-t border-[#E5DEC9] mt-6">
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.name}
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 rounded-full object-cover border border-[#E5DEC9] shadow-inner"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-[#1C1008]">
                    {testimonial.name}
                  </h4>
                  <p className="text-[10px] text-[#1C1008]/50 font-bold font-mono">
                    {testimonial.role} at <span className="text-[#D97706]">{testimonial.company}</span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
