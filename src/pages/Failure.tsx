import { AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"

export default function Failure() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#091425_0%,#10223c_100%)] px-6 py-10 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-400/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.18em] text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            Payment cancelled
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
            Your checkout was not completed.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            No worries. This usually just means the payment window was closed or
            cancelled before finishing. You can go back and request a fresh
            payment link whenever you are ready.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="btn-primary">
              Back to home
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Levamen Tech
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
