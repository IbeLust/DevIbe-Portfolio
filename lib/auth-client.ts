'use client'

// Stub auth client
export const authClient = {
  signIn: { email: async () => ({}) },
  signUp: { email: async () => ({}) },
  signOut: async () => {},
  useSession: () => ({ data: null, isPending: false }),
}

export const { signIn, signUp, signOut, useSession } = authClient

