import { api } from '@/lib/api'
import type { Credentials, User, UserRecord } from '@/types'

/** Thrown when the email/password pair doesn't match a user. */
export class InvalidCredentialsError extends Error {
  constructor(message = 'Incorrect email or password.') {
    super(message)
    this.name = 'InvalidCredentialsError'
  }
}

/**
 * JSON Server has no auth endpoint, so we look the user up by email and
 * compare the password client-side. That is fine for a mock API but is NOT
 * how a real backend should work — a production login posts credentials to
 * the server and gets back a signed token.
 */
export async function login({ email, password }: Credentials): Promise<User> {
  const { data } = await api.get<UserRecord[]>('/users', {
    params: { email: email.trim().toLowerCase() },
  })

  const record = data.at(0)
  if (!record || record.password !== password) {
    throw new InvalidCredentialsError()
  }

  // Strip the password before it can reach React state or storage.
  const { password: _password, ...user } = record
  void _password
  return user
}
