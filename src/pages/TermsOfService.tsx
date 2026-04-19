import { FileText, Mail, ShieldCheck } from "lucide-react"

const termsSections = [
  {
    title: "1. Who these terms apply to",
    paragraphs: [
      "These Terms of Service apply to your use of the Levamen Tech website, demo pages, inquiry forms, review forms, and any website design or development services you request through this site.",
      "As of April 18, 2026, Levamen Tech is an independent business name operated by an individual founder and is not currently organized as an LLC or corporation. In these terms, references to Levamen Tech, we, or us mean that individual operator.",
    ],
  },
  {
    title: "2. Website use and demo content",
    paragraphs: [
      "The site and its demos are provided to show design direction, layout ideas, and example industry concepts. Demo content may be illustrative and should not be treated as a guarantee that a specific feature, visual, or timeline will be included in your final project.",
      "You agree not to misuse the site, attempt to disrupt the service, scrape protected areas, upload harmful material, or use the brand, demos, or copy in a misleading way.",
    ],
  },
  {
    title: "3. Project inquiries, proposals, and scope",
    paragraphs: [
      "Submitting a contact form, pricing request, or project inquiry does not create a binding service agreement by itself. Work begins only after project scope, pricing, deliverables, and payment expectations are confirmed.",
      "Quoted pricing, package details, and timelines may change if your requested scope changes, required integrations expand, or missing content delays the project.",
    ],
    bullets: [
      "Package builders and pricing previews are estimates, not final invoices.",
      "A proposal, invoice, or written approval may be required before work starts.",
      "Client responsibilities can include timely feedback, approvals, copy, branding assets, and access to third-party accounts.",
    ],
  },
  {
    title: "4. Payments, refunds, and billing",
    paragraphs: [
      "If paid work is approved, payment terms will be communicated clearly before any charge is made. Levamen Tech may use third-party payment providers such as Stripe to process invoices, subscriptions, checkout links, or billing updates.",
      "If your project includes recurring maintenance, hosting, or support, those recurring charges and any grace periods will be disclosed before you are billed.",
    ],
    bullets: [
      "Refunds, if offered, are handled according to the project agreement or package terms shared with you at the time of purchase.",
      "Third-party processor fees, domain registration costs, or already-completed custom work may be non-refundable once incurred.",
      "Failure to pay for ongoing services can result in paused support, temporary service interruption, or site suspension after notice.",
    ],
  },
  {
    title: "5. Content ownership and client materials",
    paragraphs: [
      "You are responsible for making sure any logos, images, copy, reviews, testimonials, and other materials you provide can be legally used for your project.",
      "Unless a separate written agreement says otherwise, pre-existing Levamen Tech processes, reusable code patterns, design systems, and internal tools remain the property of Levamen Tech, while final client deliverables are licensed or transferred according to the project agreement.",
    ],
  },
  {
    title: "6. Availability, warranties, and liability",
    paragraphs: [
      "Levamen Tech aims to keep the site accurate, available, and secure, but the site and demo content are provided on an as-is and as-available basis. No promise is made that the website will always be uninterrupted or error-free.",
      "To the fullest extent allowed by law, Levamen Tech is not liable for indirect, incidental, special, or consequential damages arising from your use of the site or from delayed or interrupted access to the site, third-party services, or project communications.",
    ],
  },
  {
    title: "7. Updates and contact",
    paragraphs: [
      "These terms may be updated from time to time as the business grows, adds services, or changes legal structure. Updated terms will be posted on this page with a revised effective date.",
      "Questions about these terms can be sent to admin@levamentech.com.",
    ],
  },
]

export default function TermsOfService() {
  return (
    <section className="section pt-8 sm:pt-10">
      <div className="container-custom">
        <div className="section-panel px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="min-w-0 max-w-4xl">
            <div className="section-kicker">
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              Terms of Service
            </div>

            <h1 className="hero-heading mt-6 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-[3.6rem] md:leading-[1.02]">
              Straightforward terms for a small, independent web studio.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              These terms cover website visitors, demo viewers, project
              inquiries, and any services requested through Levamen Tech.
              Last updated April 18, 2026.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <article className="legal-prose">
              {termsSections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </article>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <div className="card">
                <div className="flex items-center gap-3 text-slate-950">
                  <ShieldCheck className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                    Quick Summary
                  </h2>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <p>Project requests are not binding until scope and payment terms are confirmed.</p>
                  <p>Demo pages show direction and examples, not guaranteed deliverables.</p>
                  <p>Payments, refunds, and recurring billing are clarified before charges are made.</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 text-slate-950">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                    Questions?
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Email{" "}
                  <a
                    href="mailto:admin@levamentech.com"
                    className="font-semibold text-slate-950"
                  >
                    admin@levamentech.com
                  </a>{" "}
                  if you want clarification before starting a project.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
