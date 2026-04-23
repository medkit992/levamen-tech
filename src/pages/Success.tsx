import { CheckCircle2, ReceiptText } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import Seo from "../components/seo/Seo"

export default function Success() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get("session_id")

  return (
    <>
      <Seo
        title="Payment Success"
        description="Levamen Tech payment confirmation page."
        path="/success"
        noindex
      />
      <main className="min-h-screen bg-[linear-gradient(180deg,#091425_0%,#10223c_100%)] px-6 py-10 text-white sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-400/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Payment successful
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
            Thank you. Your payment went through.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            We received your checkout submission successfully. Levamen Tech will
            review the payment and follow up with next steps for your website
            project.
          </p>

          {sessionId ? (
            <div className="mt-8 rounded-[1.5rem] border border-white/12 bg-white/[0.06] p-5">
              <div className="flex items-center gap-3 text-slate-100">
                <ReceiptText className="h-5 w-5" />
                <strong>Checkout session ID</strong>
              </div>
              <div className="mt-3 break-all rounded-2xl bg-black/20 px-4 py-3 font-mono text-sm text-slate-200">
                {sessionId}
              </div>
            </div>
          ) : null}

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
    </>
  )
}
