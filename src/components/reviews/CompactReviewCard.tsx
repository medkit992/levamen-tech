import { Star } from "lucide-react"
import type { ApprovedReview } from "../../lib/publicReviews"

function formatRating(rating: number) {
  return rating.toFixed(1).replace(".0", "")
}

export default function CompactReviewCard({
  review,
}: {
  review: ApprovedReview
}) {
  return (
    <article className="card-glass h-full">
      <div className="flex items-center gap-1 text-amber-400">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={[
              "h-4 w-4",
              index < Math.round(review.rating) ? "fill-current" : "fill-transparent",
            ].join(" ")}
            strokeWidth={1.8}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-slate-600">
          {formatRating(review.rating)}
        </span>
      </div>

      {review.review_headline ? (
        <h3 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
          {review.review_headline}
        </h3>
      ) : null}

      <p className="mt-4 text-sm leading-7 text-slate-600">
        {review.review_text}
      </p>

      <div className="mt-6 border-t border-slate-200/80 pt-4">
        <div className="font-extrabold tracking-[-0.02em] text-slate-950">
          {review.client_name}
        </div>
        <div className="mt-1 text-sm text-slate-500">
          {[review.business_name, review.industry].filter(Boolean).join(" / ") ||
            "Levamen Tech client"}
        </div>
      </div>
    </article>
  )
}
