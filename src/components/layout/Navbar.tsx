import { useEffect, useState } from "react"
import { ArrowRight, Menu, Sparkles, X } from "lucide-react"
import { NavLink, Link } from "react-router-dom"
import {
  footerContactLinks,
  legalNavItems,
  primaryNavItems,
} from "./siteLinks"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const handleCloseMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = isMenuOpen ? "hidden" : previousOverflow

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="relative sticky top-0 z-50 border-b border-white/50 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="container-custom px-4 sm:px-6 lg:px-0">
        <nav className="flex min-h-[5rem] items-center justify-between gap-4 py-3">
          <NavLink
            to="/"
            className="group flex min-w-0 items-center gap-3"
            onClick={handleCloseMenu}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(255,122,24,0.14),rgba(75,140,255,0.16))] text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-white/70 transition duration-300 group-hover:-translate-y-0.5">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-slate-400 sm:text-[0.7rem] sm:tracking-[0.28em]">
                Levamen
              </div>
              <span className="block text-lg font-extrabold tracking-[-0.04em] text-slate-950 sm:text-xl">
                Levamen Tech
              </span>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 lg:flex">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "relative rounded-full px-4 py-2.5 text-sm font-semibold tracking-[-0.02em] transition-all duration-200",
                    isActive
                      ? "bg-white text-slate-950 shadow-[0_14px_34px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <span className="relative flex items-center gap-2">
                    {isActive && (
                      <span className="h-2 w-2 rounded-full gradient-bg" />
                    )}
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/pricing" className="btn-secondary !min-h-[2.85rem] !px-5">
              See Plans
            </Link>
            <Link to="/contact" className="btn-primary !min-h-[2.85rem] !px-5">
              Start a Project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-white lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {isMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 top-[5rem] bg-slate-950/12 backdrop-blur-[2px] lg:hidden"
            onClick={handleCloseMenu}
          />

          <div className="absolute inset-x-4 top-[calc(100%+0.8rem)] z-[55] lg:hidden">
            <div
              id="mobile-navigation"
              className="max-h-[calc(100dvh-6.8rem)] overflow-y-auto overscroll-contain rounded-[1.9rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,249,255,0.95))] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                    Navigation
                  </p>
                  <p className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                    Browse the site cleanly on mobile.
                  </p>
                </div>
                <div className="rounded-full border border-orange-200/70 bg-orange-50/90 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700">
                  Levamen Tech
                </div>
              </div>

              <div className="grid gap-3">
                {primaryNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={handleCloseMenu}
                    className={({ isActive }) =>
                      [
                        "rounded-[1.45rem] border p-4 transition duration-200",
                        isActive
                          ? "border-slate-900/10 bg-slate-950 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]"
                          : "border-slate-200/80 bg-white/88 text-slate-950 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p
                            className={[
                              "text-base font-extrabold tracking-[-0.02em]",
                              isActive ? "text-white" : "text-slate-950",
                            ].join(" ")}
                          >
                            {item.label}
                          </p>
                          {item.description ? (
                            <p
                              className={[
                                "mt-1.5 text-sm leading-6",
                                isActive ? "text-slate-300" : "text-slate-500",
                              ].join(" ")}
                            >
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={[
                            "mt-0.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                            isActive
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          Open
                        </span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/pricing"
                  className="btn-secondary !w-full !rounded-[1.2rem]"
                  onClick={handleCloseMenu}
                >
                  See Pricing
                </Link>
                <Link
                  to="/contact"
                  className="btn-primary !w-full !rounded-[1.2rem]"
                  onClick={handleCloseMenu}
                >
                  Reach Out
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 border-t border-slate-200/80 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Legal
                  </p>
                  <div className="mt-3 grid gap-2">
                    {legalNavItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleCloseMenu}
                        className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Direct Contact
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {footerContactLinks.map((item) =>
                      item.href ? (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={handleCloseMenu}
                          className="block rounded-[1rem] border border-slate-200/80 bg-white/90 px-4 py-3 font-semibold transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                        >
                          <span className="block break-words [overflow-wrap:anywhere]">
                            {item.value}
                          </span>
                        </a>
                      ) : (
                        <div
                          key={item.label}
                          className="rounded-[1rem] border border-slate-200/80 bg-white/90 px-4 py-3 font-semibold"
                        >
                          <span className="block break-words [overflow-wrap:anywhere]">
                            {item.value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  )
}
