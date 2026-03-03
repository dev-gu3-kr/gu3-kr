import { findUserByEmail } from "./auth.query"

export async function getLoginCandidate(email: string) {
  return findUserByEmail(email)
}
