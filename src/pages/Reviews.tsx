import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import ReviewFormCard from "../components/reviews/ReviewFormCard"

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

  const featured = reviews.filter(r => r.featured)
  const others = reviews.filter(r => !r.featured)

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">
            Client <span className="gradient-text">Reviews</span>
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
            Real feedback from businesses we’ve worked with.
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section pt-0">
          <div className="container-custom">
            <h2 className="text-2xl font-semibold mb-6">
              ⭐ Featured Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((review) => (
                <article key={review.id} className="card-glass soft-shadow">
                  <p className="text-lg font-medium mb-2">
                    {review.review_headline}
                  </p>
                  <p className="text-[var(--color-text-muted)] mb-4">
                    {review.review_text}
                  </p>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    — {review.client_name}
                    {review.business_name && `, ${review.business_name}`}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Reviews + Form */}
      <section className="section pt-0">
        <div className="container-custom">
          <h2 className="text-2xl font-semibold mb-6">
            All Reviews
          </h2>

          {loading ? (
            <p className="text-[var(--color-text-muted)]">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              
              {/* ✅ FORM CARD (now properly used) */}
              <ReviewFormCard />

              {/* Reviews */}
              {others.map((review) => (
                <article
                  key={review.id}
                  className="card-glass soft-shadow"
                >
                  <p className="font-medium mb-2">
                    {review.review_headline}
                  </p>

                  <p className="text-[var(--color-text-muted)] mb-4">
                    {review.review_text}
                  </p>

                  <div className="text-sm text-[var(--color-text-muted)]">
                    — {review.client_name}
                    {review.business_name && `, ${review.business_name}`}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Reviews