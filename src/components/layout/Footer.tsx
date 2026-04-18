import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  footerContactLinks,
  footerHighlights,
  independentStudioNote,
  legalNavItems,
  primaryNavItems,
} from "./siteLinks"

export default function Footer() {
  return (
    <footer className="mt-16 px-4 pb-6 sm:px-8 lg:px-12">
      <div className="container-custom">
        <div className="space-y-6">
          <div className="section-panel overflow-hidden px-6 py-7 sm:px-8 lg:px-10">
            <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-orange-200/35 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  Ready for something cleaner?
                </div>
                <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                  Let&apos;s turn the site into something that feels intentional on every screen.
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                  Browse the demos, price out a package, or reach out directly
                  if you want a site that looks more custom and works better on
                  mobile from the start.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link to="/demos" className="btn-secondary !w-full sm:!w-auto">
                  Explore Demos
                </Link>
                <Link to="/contact" className="btn-primary !w-full sm:!w-auto">
                  Start a Project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="section-panel px-6 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.7fr_0.7fr_0.75fr]">
              <div>
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                  Levamen Tech
                </p>
                <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                  Modern sites for service businesses that want better polish.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                  Designed to feel more custom, easier to trust, and smoother to
                  use across desktop and mobile.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/85 p-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.02em] text-slate-950">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      Remote-first
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Built to work cleanly for clients without in-person meetings.
                    </p>
                  </div>

                  <div className="rounded-[1.3rem] border border-slate-200/80 bg-white/85 p-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.02em] text-slate-950">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      Straightforward setup
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Project scope, billing, privacy, and legal pages are all linked here.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Explore
                </p>
                <div className="mt-4 grid gap-2">
                  {primaryNavItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="rounded-full border border-slate-200/80 bg-white/72 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Highlights
                </p>
                <div className="mt-4 space-y-3">
                  {footerHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.2rem] border border-slate-200/80 bg-white/72 px-4 py-3 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Contact + Legal
                </p>
                <div className="mt-4 space-y-3">
                  {footerContactLinks.map((item) => {
                    const icon =
                      item.label === "Email" ? (
                        <Mail className="h-4 w-4 text-slate-500" />
                      ) : item.label === "Phone" ? (
                        <Phone className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-slate-500" />
                      )

                    const content = (
                      <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/80 bg-white/72 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950">
                        {icon}
                        <span>{item.value}</span>
                      </div>
                    )

                    return item.href ? (
                      <a key={item.label} href={item.href}>
                        {content}
                      </a>
                    ) : (
                      <div key={item.label}>{content}</div>
                    )
                  })}

                  <div className="grid gap-2 pt-1">
                    {legalNavItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="rounded-full border border-slate-200/80 bg-white/72 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200/80 pt-5 text-sm text-slate-500">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span>&copy; {new Date().getFullYear()} Levamen Tech.</span>{" "}
                  <span>{independentStudioNote}</span>
                </div>

                <div className="text-sm text-slate-500">
                  Designed to feel custom, not templated.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
