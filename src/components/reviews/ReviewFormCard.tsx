import { useState } from "react"
import { supabase } from "../../lib/supabase"

const ReviewFormCard = () => {
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
        approved: false, // stays hidden until admin approves
      },
    ])

    setLoading(false)

    if (error) {
      setError("Something went wrong. Try again.")
      console.error(error)
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

  return (
    <div className="card-glass soft-shadow">
      {!success ? (
        <>
          <h3 className="text-2xl font-semibold mb-2">
            Leave a <span className="gradient-text">Review</span>
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Share your experience working with Levamen Tech.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <input
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full p-3 rounded-lg border border-[var(--color-border)]"
            />

            {/* Business */}
            <input
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Business Name (optional)"
              className="w-full p-3 rounded-lg border border-[var(--color-border)]"
            />

            {/* Industry */}
            <input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="Industry (e.g. Plumbing, HVAC)"
              className="w-full p-3 rounded-lg border border-[var(--color-border)]"
            />

            {/* Headline */}
            <input
              name="review_headline"
              value={form.review_headline}
              onChange={handleChange}
              placeholder="Short headline"
              className="w-full p-3 rounded-lg border border-[var(--color-border)]"
            />

            {/* Review Text */}
            <textarea
              name="review_text"
              value={form.review_text}
              onChange={handleChange}
              placeholder="Write your review..."
              required
              rows={4}
              className="w-full p-3 rounded-lg border border-[var(--color-border)]"
            />

            {/* Rating */}
            <div>
              <label className="text-sm text-[var(--color-text-muted)]">
                Rating
              </label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg border border-[var(--color-border)]"
              >
                <option value={5}>★★★★★ (5)</option>
                <option value={4}>★★★★☆ (4)</option>
                <option value={3}>★★★☆☆ (3)</option>
                <option value={2}>★★☆☆☆ (2)</option>
                <option value={1}>★☆☆☆☆ (1)</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </form>
        </>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">
            🎉 Review Submitted!
          </h3>
          <p className="text-[var(--color-text-muted)]">
            Thanks! Your review will appear once approved.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewFormCard