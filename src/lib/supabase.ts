import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export async function getFunctionAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Unauthorized.')
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  }
}
