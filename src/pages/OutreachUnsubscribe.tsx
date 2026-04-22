import { MailCheck, MailWarning, ShieldBan } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

type RequestState = "idle" | "loading" | "success" | "error"

export default function OutreachUnsubscribe() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<RequestState>("idle")
  const [message, setMessage] = useState("")

  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams])

  async function handleUnsubscribe() {
    if (!token) {
      setState("error")
      setMessage("This unsubscribe link is missing its token.")
      return
    }

    setState("loading")
    setMessage("")

    const { data, error } = await supabase.functions.invoke("outreach-unsubscribe", {
      body: { token },
    })

    if (error) {
      setState("error")
      setMessage(error.message || "We could not process your unsubscribe request.")
      return
    }

    if (data?.error) {
      setState("error")
      setMessage(String(data.error))
      return
    }

    setState("success")
    setMessage(
      typeof data?.message === "string"
        ? data.message
        : "You have been removed from future outreach emails."
    )
  }

  return (
    <section className="section pt-8 sm:pt-10">
      <div className="container-custom">
        <div className="section-panel px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="max-w-3xl">
            <div className="section-kicker">
              <ShieldBan className="h-3.5 w-3.5" strokeWidth={2} />
              Outreach Preferences
            </div>

            <h1 className="hero-heading mt-6 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-[3.6rem] md:leading-[1.02]">
              Unsubscribe from Levamen Tech outreach.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              This page removes the email tied to this link from future outreach
              sends. It does not affect existing client billing or project emails.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="card">
              <div className="flex items-center gap-3 text-slate-950">
                {state === "success" ? (
                  <MailCheck className="h-5 w-5 text-emerald-600" />
                ) : (
                  <MailWarning className="h-5 w-5 text-slate-500" />
                )}
                <h2 className="text-xl font-extrabold tracking-[-0.02em]">
                  Email preference update
                </h2>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {message || "Use the button below to confirm the unsubscribe request."}
              </p>

              <div className="mt-6">
                <button
                  onClick={() => void handleUnsubscribe()}
                  disabled={state === "loading" || state === "success" || !token}
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {state === "loading"
                    ? "Processing..."
                    : state === "success"
                      ? "Unsubscribed"
                      : "Confirm unsubscribe"}
                </button>
              </div>

              {state === "error" ? (
                <div className="mt-5 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {message || "We could not process this request."}
                </div>
              ) : null}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <div className="card">
                <h2 className="text-lg font-extrabold tracking-[-0.02em] text-slate-950">
                  What this does
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <p>The linked address is added to the outreach suppression list.</p>
                  <p>Pending drafts for that lead are blocked from future sends.</p>
                  <p>You can still contact Levamen Tech directly through the main site.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
