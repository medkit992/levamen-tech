import {
  Globe,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Sparkles,
} from "lucide-react"
import headshot from "../assets/images/andrew-headshot.jpg"
import Seo from "../components/seo/Seo"
import {
  buildBreadcrumbStructuredData,
  buildWebPageStructuredData,
  siteConfig,
} from "../seo/site"

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "admin@levamentech.com",
    href: "mailto:admin@levamentech.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(864) 510-8711",
    href: "tel:+18645108711",
  },
  {
    icon: Globe,
    label: "Website",
    value: "levamentech.com",
    href: "https://levamentech.com",
  },
  {
    icon: MessageSquareText,
    label: "Preferred contact",
    value: "Email or text for the fastest response",
  },
]

const highlights = [
  "Custom business websites",
  "Modern landing pages and demo sites",
  "Clean UI with stronger branding direction",
  "Fast, responsive frontend builds",
]

const goodFit = [
  "A site that does not feel generic",
  "A more premium brand presence online",
  "Something simple, polished, and clear",
  "A developer who can actually customize things",
]

const pageTitle = "Contact Levamen Tech"
const pageDescription =
  "Reach out to Levamen Tech about a custom website project, pricing questions, demo requests, or a new service business site."

const contactStructuredData = [
  buildWebPageStructuredData({
    path: "/contact",
    title: pageTitle,
    description: pageDescription,
    pageType: "ContactPage",
  }),
  buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]),
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `${siteConfig.name} contact page`,
    url: `${siteConfig.url}/contact`,
    description: pageDescription,
    mainEntity: {
      "@id": `${siteConfig.url}/#organization`,
    },
  },
]

export default function Contact() {
  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/contact"
        image="/og-default.svg"
        keywords={[
          "contact web designer",
          "service business website designer",
          "custom website project inquiry",
          "Levamen Tech contact",
        ]}
        structuredData={contactStructuredData}
      />
      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8">
            <div className="section-panel px-6 py-8 sm:px-8 lg:px-10">
              <div className="grid gap-8 md:grid-cols-[320px_1fr] md:items-center">
                <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-none">
                  <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,122,24,0.24),rgba(75,140,255,0.18))] blur-3xl" />
                  <img
                    src={headshot}
                    alt="Portrait of Andrew from Levamen Tech"
                    className="relative z-10 aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[0_24px_70px_rgba(15,23,42,0.14)] ring-1 ring-white/70"
                  />
                </div>

                <div className="min-w-0">
                  <div className="section-kicker">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    Get to know the builder
                  </div>

                  <h1 className="hero-heading mt-6 text-3xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-[3.4rem] md:leading-[1.02]">
                    Let&apos;s build something that actually feels custom.
                  </h1>

                  <p className="mt-5 text-base leading-8 text-slate-600">
                    I&apos;m the developer behind <span className="font-extrabold text-slate-900">Levamen Tech</span>.
                    I focus on building modern websites that feel clean,
                    intentional, and memorable instead of recycled templates that
                    look like everything else online.
                  </p>

                  <p className="mt-4 text-base leading-8 text-slate-600">
                    The goal is simple: give businesses a site that looks
                    premium, works smoothly, and helps turn attention into real
                    clients.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href="mailto:admin@levamentech.com"
                      className="btn-primary !w-full sm:!w-auto"
                    >
                      <Send className="h-4 w-4" />
                      Reach out
                    </a>

                    <a
                      href="#contact-methods"
                      className="btn-secondary !w-full sm:!w-auto"
                    >
                      View contact info
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="card">
                <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  What I do
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full gradient-bg" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  Good fit if you want
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {goodFit.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-slate-900" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div id="contact-methods" className="space-y-6">
            <div className="card-glass p-6 sm:p-8">
              <div className="section-kicker">Contact details</div>

              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                Reach out directly
              </h2>

              <p className="mt-3 text-base leading-8 text-slate-600">
                Whether you already know what you want or just want to talk
                through possibilities, I&apos;m happy to help shape the direction.
              </p>

              <div className="mt-6 space-y-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon

                  const content = (
                    <div className="flex items-start gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/92 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-500">
                          {method.label}
                        </p>
                        <p className="mt-1 break-words text-base font-extrabold tracking-[-0.02em] text-slate-900 [overflow-wrap:anywhere]">
                          {method.value}
                        </p>
                      </div>
                    </div>
                  )

                  if (method.href) {
                    return (
                      <a
                        key={method.label}
                        href={method.href}
                        target={method.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        {content}
                      </a>
                    )
                  }

                  return <div key={method.label}>{content}</div>
                })}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                What happens next
              </h2>

              <div className="mt-5 space-y-4">
                {[
                  {
                    step: 1,
                    title: "You reach out",
                    description:
                      "Tell me about your business, idea, or what you want your site to improve.",
                  },
                  {
                    step: 2,
                    title: "We define the direction",
                    description:
                      "I help shape a design and structure that actually fits your brand.",
                  },
                  {
                    step: 3,
                    title: "I build it cleanly",
                    description:
                      "You get a polished site that feels intentional and ready to show off.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-extrabold tracking-[-0.02em] text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,248,240,0.96),rgba(239,245,255,0.96))] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                    Remote-first
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    I work remotely and communicate online, which keeps the
                    process simple and flexible for most clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  )
}
