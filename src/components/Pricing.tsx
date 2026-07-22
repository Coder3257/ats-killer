import { useState, useEffect } from "react";
import { Check, Star, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { PRICING_PLANS } from "../data/templates";
import { useAuth } from "../shared/contexts/AuthContext";
import posthog from "posthog-js";

export default function Pricing() {
  const { user, session } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Razorpay SDK Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async (planName: string) => {
    if (planName === "Free") {
      alert("You are already on the Free tier.");
      return;
    }

    if (!session || !user) {
      alert("Please sign in or create an account before upgrading.");
      return;
    }

    setLoadingPlan(planName);
    setErrorMessage(null);

    try {
      // 1. Create order on the server
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout order.");
      }

      const { orderId, amount, currency, keyId } = await response.json();

      // 2. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "ATS Killer",
        description: `${planName} License Activation`,
        image: "/favicon.svg",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            setLoadingPlan(planName);
            // 3. Verify payment signature on the server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName,
              }),
            });

            if (!verifyRes.ok) {
              const verifyError = await verifyRes.json();
              throw new Error(verifyError.error || "Signature verification failed.");
            }

            // Track payment completion
            try {
              if (typeof window !== 'undefined') {
                posthog.capture('payment_completed', { planName });
              }
            } catch (trackErr) {
              console.warn('Failed to track payment_completed event:', trackErr);
            }

            alert(`Success! Your account has been upgraded to the ${planName} plan.`);
            window.location.reload(); // Refresh to load upgraded limits/billing state
          } catch (err: any) {
            setErrorMessage(err.message || "Failed to verify payment transaction.");
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: user.email?.split("@")[0] || "",
          email: user.email || "",
        },
        theme: {
          color: "#1C1008",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not initiate payment process. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-[#FAF8F5] relative">

      {/* Decorative Grid Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(#1C1008_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.015] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#D97706] uppercase">
            Simple, Transparent Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#1C1008]">
            Invest in your career.
          </h2>
          <p className="text-sm sm:text-base text-[#1C1008]/70 max-w-lg mx-auto font-sans font-medium">
            Join thousands of job seekers landing roles at Stripe, Google, Swiggy, and Razorpay. Cancel anytime.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-[#991B1B] text-xs font-semibold p-4 rounded-2xl border border-red-200/50 max-w-xl mx-auto mb-8 text-center">
            {errorMessage}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, index) => {
            return (
              <div
                key={index}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative border ${plan.popular
                    ? "bg-[#1C1008] text-[#FAF8F5] border-[#1C1008] shadow-xl md:-translate-y-4 scale-105"
                    : "bg-[#F5F0E8] text-[#1C1008] border-[#EBE3D5] shadow-xs hover:shadow-md"
                  }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#D97706] text-[#FAF8F5] text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                )}

                {/* Plan Metadata */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display font-bold">
                      {plan.name}
                    </h3>
                    {plan.name === "Lifetime" && (
                      <span className="bg-[#D97706]/15 text-[#D97706] px-2 py-0.5 text-[9px] font-mono font-bold rounded">
                        Best Value
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mb-6 font-medium ${plan.popular ? "text-[#FAF8F5]/75" : "text-[#1C1008]/70"}`}>
                    {plan.description}
                  </p>

                  {/* Price display */}
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl sm:text-5xl font-display font-extrabold">
                      {plan.price}
                    </span>
                    <span className={`text-xs ml-2 font-mono font-bold ${plan.popular ? "text-[#FAF8F5]/60" : "text-[#1C1008]/50"}`}>
                      / {plan.period}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs font-semibold">
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-[#FAF8F5]/10 text-[#D97706]" : "bg-[#1C1008]/5 text-[#D97706]"
                          }`}>
                          <Check className="h-3 w-3 stroke-[3.5]" />
                        </span>
                        <span className={plan.popular ? "text-[#FAF8F5]/90" : "text-[#1C1008]/80"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action button */}
                <button
                  onClick={() => handleCheckout(plan.name)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${loadingPlan !== null ? "opacity-50 cursor-not-allowed" : ""
                    } ${plan.popular
                      ? "bg-[#D97706] hover:bg-[#D97706]/90 text-[#FAF8F5] shadow-lg shadow-[#D97706]/10"
                      : "bg-[#1C1008] hover:bg-[#1C1008]/90 text-[#FAF8F5]"
                    }`}
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#FAF8F5]" />
                      Processing...
                    </>
                  ) : (
                    plan.ctaText
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Guarantee Seal */}
        <div className="mt-12 text-center flex items-center justify-center gap-2 text-xs text-[#1C1008]/60 font-semibold bg-[#F5F0E8]/50 max-w-sm mx-auto p-3 rounded-xl border border-[#EBE3D5]/40">
          <ShieldCheck className="h-4.5 w-4.5 text-[#10B981]" />
          <span>100% Secure Checkout • 14-day refund policy</span>
        </div>

      </div>
    </section>
  );
}