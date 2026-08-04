import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

/** Turns an axios failure into something worth showing a user. */
export function toErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    if (!error.response) {
      return 'Cannot reach the API. Is the mock server running on port 4000?'
    }
    if (error.response.status === 404) return 'That record no longer exists.'
    return `Request failed (${error.response.status}).`
  }
  if (error instanceof Error) return error.message
  return fallback
}
