import { useState } from "react"
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react"
import { supabase } from "../../lib/supabase"

type ReviewFormCardProps = {
  totalReviews?: number
  averageRating?: number
}

const ReviewFormCard = ({
  totalReviews = 0,
  averageRating = 5,
}: ReviewFormCardProps) => {
  const [form, setForm] = useState({
    client_name: "",
    business_name: "",
    industry: "",
    review_headline: "",
    review_text: "",
    rating: 5,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const { error } = await supabase.from("reviews").insert([
      {
        ...form,
        rating: Number(form.rating),
        approved: false,
      },
    ])

    setLoading(false)

    if (error) {
      setError("Something went wrong. Try again.")
      return
    }

    setSuccess(true)

    setForm({
      client_name: "",
      business_name: "",
      industry: "",
      review_headline: "",
      review_text: "",
      rating: 5,
    })
  }

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      {!success ? (
        <>
          <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,71,0.22),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))] px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Share Your Experience
            </div>

            <h3 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-950">
              Leave a <span className="gradient-text">Review</span>
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A quick note about the process, the result, or how your new site
              feels to use goes a long way.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Current average
                </p>
                <div className="mt-2 flex items-center gap-2 text-slate-950">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-semibold">
                    {averageRating.toFixed(1).replace(".0", "")}/5
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Approved reviews
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {totalReviews}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              Reviews are screened before publishing, which helps keep the page
              clean and trustworthy.
            </div>
          </div>

          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className={inputClassName}
              />

              <input
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                placeholder="Business name (optional)"
                className={inputClassName}
              />

              <input
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="Industry (Plumbing, HVAC, Dental, etc.)"
                className={inputClassName}
              />

              <input
                name="review_headline"
                value={form.review_headline}
                onChange={handleChange}
                placeholder="Short headline"
                className={inputClassName}
              />

              <textarea
                name="review_text"
                value={form.review_text}
                onChange={handleChange}
                placeholder="What stood out most about working together?"
                required
                rows={4}
                className={`${inputClassName} resize-none`}
              />

              <div>
                <label
                  htmlFor="rating"
                  className="mb-2 block text-sm font-medium text-slate-600"
                >
                  Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value={5}>5 stars - Excellent</option>
                  <option value={4}>4 stars - Great</option>
                  <option value={3}>3 stars - Good</option>
                  <option value={2}>2 stars - Fair</option>
                  <option value={1}>1 star - Needs work</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-2xl py-3.5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>

              <p className="text-xs leading-6 text-slate-500">
                Your review is submitted for approval first, then added to the
                public page once it&apos;s ready.
              </p>

              {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            </form>
          </div>
        </>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            Review submitted
          </h3>
          <p className="mt-3 text-slate-600">
            Thanks for taking the time. Once it&apos;s approved, it&apos;ll appear
            with the rest of the client feedback here.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewFormCard
