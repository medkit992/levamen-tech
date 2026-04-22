import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Seo from "../components/seo/Seo";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Laptop2,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  buildBreadcrumbStructuredData,
  buildWebPageStructuredData,
  siteConfig,
} from "../seo/site";

type PlanKey = "starter" | "growth" | "premium";

type AddonKey =
  | "extraPage"
  | "seo"
  | "contactForm"
  | "booking"
  | "blog"
  | "rush"
  | "prioritySupport";

type DomainChoice = "have-domain" | "need-domain";

type StepShellProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

const VALID_PLAN_KEYS: PlanKey[] = ["starter", "growth", "premium"];

const PLAN_DETAILS: Record<
  PlanKey,
  {
    name: string;
    setupPrice: number;
    monthlyPrice: number;
    description: string;
    features: string[];
  }
> = {
  starter: {
    name: "Starter",
    setupPrice: 149,
    monthlyPrice: 39,
    description:
      "Best for businesses that need a clean, professional online presence with a simple homepage.",
    features: [
      "1-page static website",
      "Mobile responsive",
      "Modern visual design",
      "Basic SEO setup",
      "Hosting and maintenance included",
    ],
  },
  growth: {
    name: "Growth",
    setupPrice: 299,
    monthlyPrice: 79,
    description:
      "The best balance of value and flexibility for most local businesses.",
    features: [
      "Up to 5 pages",
      "Custom branded layout",
      "Mobile responsive",
      "Contact form integration",
      "SEO and speed optimization",
      "Hosting and maintenance included",
    ],
  },
  premium: {
    name: "Premium",
    setupPrice: 499,
    monthlyPrice: 149,
    description:
      "A more advanced custom website package for businesses that want premium polish and more flexibility.",
    features: [
      "Up to 10 pages",
      "Premium custom design",
      "Advanced sections",
      "Priority edits/support",
      "Conversion-focused structure",
      "Hosting and maintenance included",
    ],
  },
};

const ADDONS: Record<
  AddonKey,
  {
    name: string;
    type: "one-time" | "monthly";
    price: number;
    description: string;
  }
> = {
  extraPage: {
    name: "Extra Page",
    type: "one-time",
    price: 75,
    description: "Add an additional custom page beyond the plan limit.",
  },
  seo: {
    name: "SEO Boost",
    type: "monthly",
    price: 35,
    description: "Ongoing SEO improvements and search visibility support.",
  },
  contactForm: {
    name: "Advanced Contact Form",
    type: "one-time",
    price: 45,
    description: "Expanded contact or lead form setup with better structure.",
  },
  booking: {
    name: "Booking Integration",
    type: "one-time",
    price: 95,
    description: "Connect a booking, scheduling, or consultation flow.",
  },
  blog: {
    name: "Blog / News Section",
    type: "one-time",
    price: 120,
    description: "Add a blog or content section for future posting needs.",
  },
  rush: {
    name: "Rush Build",
    type: "one-time",
    price: 150,
    description: "Priority turnaround for businesses that need their site sooner.",
  },
  prioritySupport: {
    name: "Priority Support",
    type: "monthly",
    price: 25,
    description: "Faster response times for updates and support requests.",
  },
};

const pricingPageTitle = "Website Pricing and Packages for Service Businesses";
const pricingPageDescription =
  "Compare Levamen Tech website packages, customize your plan with add-ons, and send a project request for review before any payment is collected.";

const pricingStructuredData = [
  buildWebPageStructuredData({
    path: "/pricing",
    title: pricingPageTitle,
    description: pricingPageDescription,
  }),
  buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
  ]),
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Custom website design and development",
    description: pricingPageDescription,
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
    areaServed: "United States",
    serviceType: "Service business website design",
    offers: VALID_PLAN_KEYS.map((planKey) => {
      const plan = PLAN_DETAILS[planKey];

      return {
        "@type": "Offer",
        name: `${plan.name} Website Package`,
        priceCurrency: "USD",
        price: plan.setupPrice,
        description: `${plan.description} Monthly maintenance starts at ${plan.monthlyPrice} per month.`,
      };
    }),
  },
];

function StepShell({
  title,
  description,
  icon,
  children,
}: StepShellProps) {
  return (
    <div className="card-glass soft-shadow rounded-[1.75rem] p-5 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="rounded-2xl p-3 gradient-bg text-white">{icon}</div>
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get("plan");

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(() => {
    return VALID_PLAN_KEYS.includes(initialPlan as PlanKey)
      ? (initialPlan as PlanKey)
      : "growth";
  });

  const [selectedAddons, setSelectedAddons] = useState<AddonKey[]>([]);
  const [domainChoice, setDomainChoice] = useState<DomainChoice>("have-domain");
  const [domainName, setDomainName] = useState("");
  const [needsDomainPrivacy, setNeedsDomainPrivacy] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    businessName: "",
    phone: "",
    businessType: "",
    timeline: "",
    pagesNeeded: "",
    inspiration: "",
    goals: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleAddon = (key: AddonKey) => {
    setSelectedAddons((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const selectedPlanData = PLAN_DETAILS[selectedPlan];

  const addonBreakdown = useMemo(() => {
    const oneTime = selectedAddons
      .filter((key) => ADDONS[key].type === "one-time")
      .reduce((sum, key) => sum + ADDONS[key].price, 0);

    const monthly = selectedAddons
      .filter((key) => ADDONS[key].type === "monthly")
      .reduce((sum, key) => sum + ADDONS[key].price, 0);

    return { oneTime, monthly };
  }, [selectedAddons]);

  const domainOneTime = domainChoice === "need-domain" ? 20 : 0;
  const domainPrivacyMonthly =
    domainChoice === "need-domain" && needsDomainPrivacy ? 2 : 0;

  const totalSetup =
    selectedPlanData.setupPrice + addonBreakdown.oneTime + domainOneTime;

  const totalMonthly =
    selectedPlanData.monthlyPrice +
    addonBreakdown.monthly +
    domainPrivacyMonthly;

  const canContinueStep1 = !!selectedPlan;
  const canContinueStep2 = true;
  const canContinueStep3 =
    domainChoice === "have-domain" || domainChoice === "need-domain";
  const canContinueStep4 =
    form.fullName.trim() && form.email.trim() && form.businessName.trim();

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetSubmissionState = () => {
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const inquirySnapshot = {
      plan: {
        key: selectedPlan,
        ...selectedPlanData,
      },
      addons: selectedAddons.map((key) => ({
        key,
        ...ADDONS[key],
      })),
      domain: {
        choice: domainChoice,
        domainName,
        needsDomainPrivacy,
        oneTimeFee: domainOneTime,
        monthlyFee: domainPrivacyMonthly,
      },
      customer: form,
      pricing: {
        addonOneTimeTotal: addonBreakdown.oneTime,
        addonMonthlyTotal: addonBreakdown.monthly,
        totalSetup,
        totalMonthly,
      },
    };

    const { error } = await supabase.from("pricing_inquiries").insert({
      selected_plan: selectedPlan,
      selected_addons: selectedAddons,

      plan_name: selectedPlanData.name,
      plan_setup_price: selectedPlanData.setupPrice,
      plan_monthly_price: selectedPlanData.monthlyPrice,

      addon_one_time_total: addonBreakdown.oneTime,
      addon_monthly_total: addonBreakdown.monthly,

      domain_choice: domainChoice,
      domain_name: domainName.trim() || null,
      needs_domain_privacy:
        domainChoice === "need-domain" ? needsDomainPrivacy : false,
      domain_one_time_fee: domainOneTime,
      domain_privacy_monthly_fee: domainPrivacyMonthly,

      total_setup: totalSetup,
      total_monthly: totalMonthly,

      full_name: form.fullName.trim(),
      email: form.email.trim(),
      business_name: form.businessName.trim(),
      phone: form.phone.trim() || null,
      business_type: form.businessType.trim() || null,
      timeline: form.timeline || null,
      pages_needed: form.pagesNeeded.trim() || null,
      inspiration: form.inspiration.trim() || null,
      goals: form.goals.trim() || null,
      notes: form.notes.trim() || null,

      inquiry_snapshot: inquirySnapshot,
    });

    if (error) {
      setSubmitError(
        "Something went wrong while sending your request. Please try again."
      );
      setIsSubmitting(false);
      return;
    }

    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <>
      <Seo
        title={pricingPageTitle}
        description={pricingPageDescription}
        path="/pricing"
        keywords={[
          "website pricing for service businesses",
          "small business website packages",
          "web design pricing",
          "website maintenance plans",
        ]}
        structuredData={pricingStructuredData}
      />
      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text-muted)] soft-shadow">
              <Sparkles size={16} />
              Build your website package
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl md:text-5xl">
              Choose your <span className="gradient-text">website plan</span>
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
              Pick your plan, customize it with add-ons, choose your domain
              setup, and send over your business details. I’ll review your
              request and reach out before any payment is requested.
            </p>
          </div>

          <aside className="card soft-shadow rounded-[1.75rem] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="text-[var(--color-ocean-3)]" size={20} />
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                What to expect
              </h3>
            </div>

            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li className="flex gap-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 text-[var(--color-ocean-3)]"
                />
                <span>Your package request is reviewed before anything is charged</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 text-[var(--color-ocean-3)]"
                />
                <span>You'll get a follow-up email to confirm scope and details</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 text-[var(--color-ocean-3)]"
                />
                <span>Hosting and maintenance are still included in monthly pricing</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 text-[var(--color-ocean-3)]"
                />
                <span>Payment is handled only after the project scope is approved</span>
              </li>
            </ul>
          </aside>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 sm:gap-3">
          {[
            { id: 1, label: "Plan" },
            { id: 2, label: "Add-ons" },
            { id: 3, label: "Domain" },
            { id: 4, label: "Project Details" },
            { id: 5, label: "Review" },
          ].map((item) => {
            const isActive = step === item.id;
            const isComplete = step > item.id;

            return (
              <div
                key={item.id}
                className={[
                  "rounded-full border px-4 py-2 text-xs transition sm:text-sm",
                  isActive
                    ? "gradient-bg border-transparent text-white"
                    : isComplete
                    ? "border-[var(--color-border)] bg-white text-[var(--color-text)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)]",
                ].join(" ")}
              >
                {isComplete ? "✓" : item.id}. {item.label}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {submitSuccess && (
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                Your request was sent successfully. I’ll review it and reach out
                before any payment is requested.
              </div>
            )}

            {submitError && (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {submitError}
              </div>
            )}

            {step === 1 && (
              <StepShell
                title="Select your base plan"
                description="Choose the package that best matches the type of site you need. You can customize it in the next steps."
                icon={<Laptop2 size={22} />}
              >
                <div className="grid gap-5 md:grid-cols-3">
                  {(Object.keys(PLAN_DETAILS) as PlanKey[]).map((key) => {
                    const plan = PLAN_DETAILS[key];
                    const active = selectedPlan === key;

                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => {
                          resetSubmissionState();
                          setSelectedPlan(key);
                        }}
                        className={[
                          "text-left rounded-3xl border p-5 transition",
                          active
                            ? "card-glass glow-blue border-transparent"
                            : "card hover:-translate-y-1",
                        ].join(" ")}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-[var(--color-text)]">
                            {plan.name}
                          </h3>
                          {key === "growth" && (
                            <span className="rounded-full px-3 py-1 text-xs font-medium text-white gradient-bg">
                              Most Popular
                            </span>
                          )}
                        </div>

                        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                          {plan.description}
                        </p>

                        <div className="mb-4">
                          <div className="text-3xl font-bold text-[var(--color-text)]">
                            ${plan.setupPrice}
                          </div>
                          <div className="text-sm text-[var(--color-text-muted)]">
                            setup + ${plan.monthlyPrice}/month
                          </div>
                        </div>

                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                            >
                              <Check
                                size={14}
                                className="mt-1 text-[var(--color-ocean-3)]"
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                title="Choose add-ons"
                description="Optional upgrades you can stack onto your plan. These can improve lead capture, SEO, content flexibility, and support."
                icon={<Sparkles size={22} />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {(Object.keys(ADDONS) as AddonKey[]).map((key) => {
                    const addon = ADDONS[key];
                    const active = selectedAddons.includes(key);

                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => {
                          resetSubmissionState();
                          toggleAddon(key);
                        }}
                        className={[
                          "rounded-3xl border p-5 text-left transition",
                          active
                            ? "card-glass glow-sunset border-transparent"
                            : "card hover:-translate-y-1",
                        ].join(" ")}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)]">
                              {addon.name}
                            </h3>
                            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                              {addon.description}
                            </p>
                          </div>

                          {active && (
                            <div className="rounded-full gradient-bg p-2 text-white">
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        <div className="text-sm font-medium text-[var(--color-text)]">
                          ${addon.price}{" "}
                          {addon.type === "monthly" ? "/ month" : "one-time"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                title="Domain setup"
                description="Tell me whether you already have a domain or want me to register one for you."
                icon={<Globe size={22} />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetSubmissionState();
                      setDomainChoice("have-domain");
                    }}
                    className={[
                      "rounded-3xl border p-6 text-left transition",
                      domainChoice === "have-domain"
                        ? "card-glass glow-blue border-transparent"
                        : "card",
                    ].join(" ")}
                  >
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">
                      I already have a domain
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      I’ll connect and configure your existing domain during
                      setup.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetSubmissionState();
                      setDomainChoice("need-domain");
                    }}
                    className={[
                      "rounded-3xl border p-6 text-left transition",
                      domainChoice === "need-domain"
                        ? "card-glass glow-sunset border-transparent"
                        : "card",
                    ].join(" ")}
                  >
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">
                      I need a domain purchased
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      I’ll buy and configure one for you for a small setup fee.
                    </p>
                    <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
                      + $20 one-time
                    </p>
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Domain name
                    </label>
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => {
                        resetSubmissionState();
                        setDomainName(e.target.value);
                      }}
                      placeholder="examplebusiness.com"
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  {domainChoice === "need-domain" && (
                    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={needsDomainPrivacy}
                          onChange={(e) => {
                            resetSubmissionState();
                            setNeedsDomainPrivacy(e.target.checked);
                          }}
                          className="mt-1"
                        />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          Add domain privacy protection for{" "}
                          <span className="font-medium text-[var(--color-text)]">
                            $2/month
                          </span>
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                title="Business and project details"
                description="Share the essentials so I can review the request, confirm scope, and reach out with next steps."
                icon={<Receipt size={22} />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Business Name *
                    </label>
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Business Type
                    </label>
                    <input
                      name="businessType"
                      value={form.businessType}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      placeholder="Landscaping, restaurant, barber shop..."
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Preferred Timeline
                    </label>
                    <select
                      name="timeline"
                      value={form.timeline}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">As soon as possible</option>
                      <option value="1-2-weeks">1–2 weeks</option>
                      <option value="2-4-weeks">2–4 weeks</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Estimated Number of Pages
                    </label>
                    <input
                      name="pagesNeeded"
                      value={form.pagesNeeded}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      placeholder="Example: 1, 3, 5..."
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Inspiration / Reference Sites
                    </label>
                    <textarea
                      name="inspiration"
                      value={form.inspiration}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      rows={3}
                      placeholder="Drop links or describe styles you like..."
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Main Goals for the Website
                    </label>
                    <textarea
                      name="goals"
                      value={form.goals}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      rows={4}
                      placeholder="What should the site help your business do? Get leads, show services, build trust, etc."
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Extra Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={(e) => {
                        resetSubmissionState();
                        handleInput(e);
                      }}
                      rows={4}
                      placeholder="Anything else you'd like me to know before I review the request?"
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none focus:border-[var(--color-ocean-3)]"
                    />
                  </div>
                </div>

                <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                  After you submit this request, I’ll review everything and
                  follow up before any payment is requested.
                </p>
              </StepShell>
            )}

            {step === 5 && (
              <StepShell
                title="Review your package"
                description="Check your package details below, then submit your request for review."
                icon={<Receipt size={22} />}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      Plan
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      {selectedPlanData.name} — ${selectedPlanData.setupPrice}{" "}
                      setup + ${selectedPlanData.monthlyPrice}/month
                    </p>

                    <h4 className="mt-5 text-sm font-semibold text-[var(--color-text)]">
                      Add-ons
                    </h4>
                    {selectedAddons.length === 0 ? (
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                        No add-ons selected
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-muted)]">
                        {selectedAddons.map((key) => (
                          <li key={key}>
                            {ADDONS[key].name} — ${ADDONS[key].price}{" "}
                            {ADDONS[key].type === "monthly"
                              ? "/ month"
                              : "one-time"}
                          </li>
                        ))}
                      </ul>
                    )}

                    <h4 className="mt-5 text-sm font-semibold text-[var(--color-text)]">
                      Domain
                    </h4>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      {domainChoice === "have-domain"
                        ? "Client already has a domain"
                        : `Levamen Tech will purchase a domain${
                            domainOneTime
                              ? ` (+$${domainOneTime} one-time)`
                              : ""
                          }`}
                    </p>
                    {domainName && (
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Requested domain: {domainName}
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      Client Details
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
                      <p>
                        <span className="font-medium text-[var(--color-text)]">
                          Name:
                        </span>{" "}
                        {form.fullName || "—"}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--color-text)]">
                          Email:
                        </span>{" "}
                        {form.email || "—"}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--color-text)]">
                          Business:
                        </span>{" "}
                        {form.businessName || "—"}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--color-text)]">
                          Type:
                        </span>{" "}
                        {form.businessType || "—"}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--color-text)]">
                          Timeline:
                        </span>{" "}
                        {form.timeline || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-white p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        Pricing Summary
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Final payment is only discussed after review and scope
                        confirmation.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                        Next step
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        Review request
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-[var(--color-text-muted)]">
                    <div className="flex items-center justify-between">
                      <span>Base setup</span>
                      <span className="font-medium text-[var(--color-text)]">
                        ${selectedPlanData.setupPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Add-on one-time total</span>
                      <span className="font-medium text-[var(--color-text)]">
                        ${addonBreakdown.oneTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Domain setup</span>
                      <span className="font-medium text-[var(--color-text)]">
                        ${domainOneTime}
                      </span>
                    </div>

                    <div className="my-3 border-t border-[var(--color-border)]" />

                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-[var(--color-text)]">
                        Total setup
                      </span>
                      <span className="font-bold text-[var(--color-text)]">
                        ${totalSetup}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Base maintenance</span>
                      <span className="font-medium text-[var(--color-text)]">
                        ${selectedPlanData.monthlyPrice}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Add-on monthly total</span>
                      <span className="font-medium text-[var(--color-text)]">
                        ${addonBreakdown.monthly}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Domain privacy</span>
                      <span className="font-medium text-[var(--color-text)]">
                        ${domainPrivacyMonthly}/month
                      </span>
                    </div>

                    <div className="my-3 border-t border-[var(--color-border)]" />

                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-[var(--color-text)]">
                        Total monthly
                      </span>
                      <span className="font-bold text-[var(--color-text)]">
                        ${totalMonthly}/month
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || submitSuccess}
                      className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isSubmitting ? "Submitting..." : submitSuccess ? "Request Sent" : "Submit for Review"}
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={isSubmitting}
                      className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      Edit details
                    </button>
                  </div>

                  <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                    This sends your package selection and project details for
                    review. You’ll be contacted before any payment is requested.
                  </p>
                </div>
              </StepShell>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1 || isSubmitting}
                className="btn-secondary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep((prev) => Math.min(5, prev + 1))}
                disabled={
                  isSubmitting ||
                  (step === 1 && !canContinueStep1) ||
                  (step === 2 && !canContinueStep2) ||
                  (step === 3 && !canContinueStep3) ||
                  (step === 4 && !canContinueStep4) ||
                  step === 5
                }
                className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <aside className="h-fit rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6 soft-shadow lg:sticky lg:top-24">
            <h3 className="text-xl font-semibold text-[var(--color-text)]">
              Live Summary
            </h3>

            <div className="mt-5 rounded-3xl bg-[var(--color-bg)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">
                Selected Plan
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                {selectedPlanData.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                ${selectedPlanData.setupPrice} setup + $
                {selectedPlanData.monthlyPrice}/month
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Add-ons
              </p>
              <div className="mt-2 space-y-2 text-sm text-[var(--color-text-muted)]">
                {selectedAddons.length ? (
                  selectedAddons.map((key) => (
                    <div key={key} className="flex justify-between gap-3">
                      <span>{ADDONS[key].name}</span>
                      <span className="whitespace-nowrap">
                        ${ADDONS[key].price}
                        {ADDONS[key].type === "monthly" ? "/mo" : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No add-ons selected</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Domain
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {domainChoice === "have-domain"
                  ? "Using existing domain"
                  : "Need Levamen Tech to purchase domain"}
              </p>
            </div>

            <div className="my-5 border-t border-[var(--color-border)]" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">
                  Setup total
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  ${totalSetup}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">
                  Monthly total
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  ${totalMonthly}/mo
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                This form now handles:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• package selection</li>
                <li>• project inquiry submission</li>
                <li>• admin-side review before payment</li>
              </ul>
            </div>
          </aside>
        </div>
        </div>
      </section>
    </>
  );
}
