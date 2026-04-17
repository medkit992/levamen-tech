import { motion } from "motion/react";
import { Link } from "react-router-dom";

type HeroProps = {
  eyebrow?: string;
  title: string;
  gradientWord?: string;
  description: string;
  primaryCtaText?: string;
  primaryCtaTo?: string;
  secondaryCtaText?: string;
  secondaryCtaTo?: string;
  align?: "left" | "center";
  compact?: boolean;
};

export default function Hero({
  eyebrow = "Modern websites for growing businesses",
  title,
  gradientWord,
  description,
  primaryCtaText = "View Demos",
  primaryCtaTo = "/demos",
  secondaryCtaText = "Contact",
  secondaryCtaTo = "/contact",
  align = "left",
  compact = false,
}: HeroProps) {
  const isCentered = align === "center";

  const renderTitle = () => {
    if (!gradientWord || !title.includes(gradientWord)) {
      return title;
    }

    const [before, after] = title.split(gradientWord);

    return (
      <>
        {before}
        <span className="gradient-text">{gradientWord}</span>
        {after}
      </>
    );
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,122,24,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.95),rgba(248,250,252,1))]" />
      <div className="absolute left-[-120px] top-16 -z-10 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="absolute right-[-100px] top-10 -z-10 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className={`container-custom ${compact ? "py-20" : "py-28 md:py-36"}`}>
        <div
          className={`grid items-center gap-12 ${
            compact ? "lg:grid-cols-1" : "lg:grid-cols-2"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={isCentered ? "mx-auto max-w-3xl text-center lg:col-span-2" : "max-w-2xl"}
          >
            <div className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm text-slate-600 soft-shadow">
              {eyebrow}
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl md:leading-tight">
              {renderTitle()}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              {description}
            </p>

            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row ${
                isCentered ? "justify-center" : ""
              }`}
            >
              <Link to={primaryCtaTo} className="btn-primary text-center">
                {primaryCtaText}
              </Link>

              <Link to={secondaryCtaTo} className="btn-secondary text-center">
                {secondaryCtaText}
              </Link>
            </div>
          </motion.div>

          {!compact && !isCentered && (
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="card-glass glow-blue relative mx-auto max-w-md overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 gradient-bg" />

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Launch-ready site</p>
                    <p className="text-sm text-slate-500">Fast, polished, built to convert</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    Levamen
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 h-3 w-28 rounded-full bg-slate-200" />
                    <div className="mb-2 h-2 w-full rounded-full bg-slate-100" />
                    <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 h-3 w-20 rounded-full bg-orange-200" />
                      <div className="h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50" />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 h-3 w-20 rounded-full bg-blue-200" />
                      <div className="h-16 rounded-xl bg-gradient-to-br from-blue-100 to-sky-50" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-8 w-24 rounded-xl gradient-bg opacity-90" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-slate-100" />
                      <div className="h-2 w-5/6 rounded-full bg-slate-100" />
                      <div className="h-2 w-2/3 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}