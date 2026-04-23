import { supabase } from "./supabase"

export type ApprovedReview = {
  id: string
  client_name: string
  business_name: string | null
  industry: string | null
  review_headline: string | null
  review_text: string
  rating: number
  featured: boolean
}

export async function fetchApprovedReviews(options?: {
  limit?: number
  featuredOnly?: boolean
}) {
  let query = supabase
    .from("reviews")
    .select(
      "id, client_name, business_name, industry, review_headline, review_text, rating, featured"
    )
    .eq("approved", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (options?.featuredOnly) {
    query = query.eq("featured", true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  return (data ?? []) as ApprovedReview[]
}
