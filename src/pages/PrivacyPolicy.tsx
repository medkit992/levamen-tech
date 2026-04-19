import { Database, LockKeyhole, Mail } from "lucide-react"

const privacySections = [
  {
    title: "1. Who this policy covers",
    paragraphs: [
      "This Privacy Policy explains how Levamen Tech collects, uses, stores, and shares information through this website, its forms, and its client communication workflows.",
      "As of April 18, 2026, Levamen Tech is an independent business operated by an individual founder rather than a registered LLC or corporation. References to Levamen Tech, we, or us in this policy mean that individual operator.",
    ],
  },
  {
    title: "2. Information we may collect",
    paragraphs: [
      "The information collected depends on how you interact with the site. That can include contact details, project inquiry details, review submissions, payment-related references, and technical information needed to keep the site running.",
    ],
    bullets: [
      "Contact details such as your name, email address, phone number, and business name.",
      "Project details such as services requested, budget-related selections, goals, inspiration, notes, and domain preferences.",
      "Review content such as your name, business name, industry, rating, and testimonial text if you submit a review.",
      "Transaction and billing references from third-party providers such as Stripe when payments or billing portals are used.",
      "Basic technical information such as browser, device, IP address, and standard provider logs used for security and site reliability.",
    ],
  },
  {
    title: "3. How information is used",
    paragraphs: [
      "Levamen Tech uses the information collected to respond to inquiries, scope projects, deliver services, review testimonials, process billing, maintain the site, and communicate with clients or prospective clients.",
    ],
    bullets: [
      "To reply to contact requests and pricing inquiries.",
      "To review project needs and prepare or confirm scope.",
      "To process payments, subscriptions, invoices, or billing updates through third-party tools.",
      "To moderate and publish approved reviews.",
      "To protect the website from abuse, spam, fraud, or unauthorized access.",
    ],
  },
  {
    title: "4. How information may be shared",
    paragraphs: [
      "Information is not sold. It may be shared only when reasonably necessary to operate the business, deliver requested services, or comply with legal obligations.",
    ],
    bullets: [
      "With infrastructure or database providers used to host the site and store form submissions.",
      "With payment processors such as Stripe for checkout, billing, and subscription management.",
      "With email or messaging tools used to communicate about a project.",
      "When required by law, legal process, or to protect rights, safety, and site integrity.",
    ],
  },
  {
    title: "5. Data retention and security",
    paragraphs: [
      "Information is kept only as long as reasonably necessary for project communication, client management, review moderation, billing records, and legal or tax obligations.",
      "Reasonable steps are taken to protect stored information, but no system can guarantee absolute security. You should avoid sending highly sensitive information through general website forms unless specifically requested through a secure process.",
    ],
  },
  {
    title: "6. Your choices and rights",
    paragraphs: [
      "You can request updates or deletion of information you have submitted, subject to any records that must be retained for billing, security, legal, or operational reasons.",
      "If you no longer want to receive direct outreach about your inquiry or project, you can ask to be removed from follow-up communications.",
    ],
  },
  {
    title: "7. Updates and contact",
    paragraphs: [
      "This policy may be updated as the site, business structure, or service providers change. The updated version will be posted on this page with a revised effective date.",
      "Questions or requests about privacy can be sent to admin@levamentech.com.",
    ],
  },
]

export default function PrivacyPolicy() {
  return (
    <section className="section pt-8 sm:pt-10">
      <div className="container-custom">
        <div className="section-panel px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="min-w-0 max-w-4xl">
            <div className="section-kicker">
              <LockKeyhole className="h-3.5 w-3.5" strokeWidth={2} />
              Privacy Policy
            </div>

            <h1 className="hero-heading mt-6 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-[3.6rem] md:leading-[1.02]">
              A practical privacy policy for contact forms, reviews, and client work.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              This policy explains what information the site may collect, why it
              is used, and how Levamen Tech handles inquiries, testimonials, and
              billing-related data. Last updated April 18, 2026.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <article className="legal-prose">
              {privacySections.map((section) => (
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
                  <Database className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                    What the site handles
                  </h2>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <p>Contact and pricing inquiry details.</p>
                  <p>Client review submissions that are approved before publishing.</p>
                  <p>Checkout or billing references handled through third-party providers.</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 text-slate-950">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                    Privacy requests
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Send requests to{" "}
                  <a
                    href="mailto:admin@levamentech.com"
                    className="font-semibold text-slate-950"
                  >
                    admin@levamentech.com
                  </a>{" "}
                  if you want submitted information reviewed, updated, or removed.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
