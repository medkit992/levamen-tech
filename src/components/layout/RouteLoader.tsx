type RouteLoaderProps = {
  preserveLayout?: boolean
}

export default function RouteLoader({
  preserveLayout = false,
}: RouteLoaderProps) {
  return (
    <div
      className={[
        "flex w-full items-center justify-center px-4 py-12 sm:px-8 lg:px-12",
        preserveLayout ? "min-h-[50vh]" : "min-h-screen",
      ].join(" ")}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-6 py-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:px-10">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-[linear-gradient(135deg,rgba(255,122,24,0.2),rgba(75,140,255,0.22))]" />
        <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
          Loading the page
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Pulling in just the code this route needs so the rest of the site can
          stay lighter and faster.
        </p>
      </div>
    </div>
  )
}
