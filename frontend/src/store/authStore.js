import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      currentOrganization: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setCurrentOrganization: (org) => set({ currentOrganization: org }),

      login: (user, session, organization) => set({ user, session, currentOrganization: organization }),
      logout: () => set({ user: null, session: null, currentOrganization: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
