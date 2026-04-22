import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)

export async function getFunctionAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    await supabase.auth.signOut()
    throw new Error('Please sign in again.')
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(session.access_token)

  if (error || !user) {
    await supabase.auth.signOut()
    throw new Error('Your session expired. Please sign in again.')
  }

  return {
    apikey: supabasePublishableKey,
    Authorization: `Bearer ${session.access_token}`,
  }
}

export async function invokeProtectedFunction<T = unknown>(
  functionName: string,
  body?: unknown
) {
  const headers = await getFunctionAuthHeaders()
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  })

  const rawText = await response.text()
  let payload: unknown = null

  if (rawText) {
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = rawText
    }
  }

  if (!response.ok) {
    let message: string | null = null

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const errorValue = (payload as { error?: unknown }).error
      const messageValue = (payload as { message?: unknown }).message

      if (typeof errorValue === 'string') {
        message = errorValue
      } else if (typeof messageValue === 'string') {
        message = messageValue
      }
    }

    throw new Error(message || `Request failed with status ${response.status}.`)
  }

  return payload as T
}
