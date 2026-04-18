import { useEffect, useState } from "react"
import { Building2, MessageSquareQuote, Sparkles, Star } from "lucide-react"
import ReviewFormCard from "../components/reviews/ReviewFormCard"
import { supabase } from "../lib/supabase"

type Review = {
  id: string
  client_name: string
  business_name?: string
  industry?: string
  review_headline?: string
  review_text: string
  rating: number
  featured: boolean
}

const formatRating = (rating: number) => rating.toFixed(1).replace(".0", "")

const ReviewStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1 text-amber-400">
    {Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={[
          "h-4 w-4",
          index < Math.round(rating) ? "fill-current" : "fill-transparent",
        ].join(" ")}
        strokeWidth={1.8}
      />
    ))}
    <span className="ml-2 text-sm font-semibold text-slate-600">
      {formatRating(rating)}
    </span>
  </div>
)

const ReviewCard = ({
  review,
  featured = false,
}: {
  review: Review
  featured?: boolean
}) => (
  <article
    className={[
      "group relative mb-6 break-inside-avoid overflow-hidden rounded-[1.65rem] border border-white/70 bg-white/90 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl",
      featured ? "md:p-7" : "",
    ].join(" ")}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,179,71,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_28%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="relative flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-4">
        <ReviewStars rating={review.rating} />
        <div className="rounded-full border border-slate-200/80 bg-slate-50/90 p-2 text-slate-400">
          <MessageSquareQuote className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </div>

      <div className="mb-5 space-y-3">
        {review.review_headline && (
          <h3 className="text-xl font-bold tracking-tight text-slate-950">
            {review.review_headline}
          </h3>
        )}
        <p className="text-[15px] leading-7 text-slate-600">
          {review.review_text}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="font-bold text-slate-900">{review.client_name}</p>
          <p className="text-sm text-slate-500">
            {[review.business_name, review.industry].filter(Boolean).join(" / ") ||
              "Levamen Tech client"}
          </p>
        </div>
        {featured && (
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Featured
          </span>
        )}
      </div>
    </div>
  </article>
)

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })

      if (!error && data) setReviews(data)
      setLoading(false)
    }

    fetchReviews()
  }, [])

  const featured = reviews.filter((review) => review.featured)
  const others = reviews.filter((review) => !review.featured)
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 5

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,179,71,0.18),_transparent_30%),linear-gradient(180deg,#fff_0%,#f8fafc_36%,#eef4ff_100%)]">
      <section className="relative px-6 pb-12 pt-10 sm:px-8 lg:px-12">
        <div className="container-custom relative">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 px-6 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:px-10 lg:px-14 lg:py-12">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_360px]">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50/90 px-4 py-2 text-sm font-medium text-orange-700">
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                  Proof that the work feels good after launch too
                </div>

                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Client <span className="gradient-text">Reviews</span> that speak
                  for the experience
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Real feedback from businesses we&apos;ve worked with, plus a
                  simple way for clients to share how the process felt from first
                  draft to final launch.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-sm font-medium text-slate-500">Average rating</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {formatRating(averageRating)}/5
                  </p>
                  <div className="mt-3">
                    <ReviewStars rating={averageRating} />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-sm font-medium text-slate-500">Approved reviews</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {reviews.length}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    A growing collection of post-project feedback.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-sm font-medium text-slate-500">Featured stories</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {featured.length}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Hand-picked shoutouts that deserve the spotlight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="px-6 pb-6 sm:px-8 lg:px-12">
          <div className="container-custom">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Spotlight
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Featured Reviews
                </h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm text-slate-500 md:flex">
                <Building2 className="h-4 w-4" strokeWidth={1.8} />
                Trusted by service businesses
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {featured.map((review) => (
                <ReviewCard key={review.id} review={review} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-20 pt-6 sm:px-8 lg:px-12">
        <div className="container-custom">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Testimonials
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                All Reviews
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-500 sm:text-right">
              The form stays pinned on larger screens so it&apos;s easy to leave a
              review while reading what other clients had to say.
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ReviewFormCard
                totalReviews={reviews.length}
                averageRating={averageRating}
              />
            </div>

            {loading ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                Loading reviews...
              </div>
            ) : others.length > 0 ? (
              <div className="columns-1 gap-6 md:columns-2">
                {others.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                <div className="mx-auto flex max-w-md flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-slate-100 p-3 text-slate-500">
                    <MessageSquareQuote className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                    First review incoming
                  </h3>
                  <p className="mt-3 text-slate-500">
                    Once approved reviews start coming in, they&apos;ll appear here
                    in a polished testimonial grid instead of this empty state.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Reviews
