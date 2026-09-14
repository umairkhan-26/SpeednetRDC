"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "../types";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, fullName?: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: { fullName: "Alex Johnson", email: "alex.johnson@example.com" },
      isAuthenticated: true,
      login: (email, fullName) =>
        set({ isAuthenticated: true, user: { fullName: fullName ?? "Traveler", email } }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateProfile: (profile) =>
        set((state) => ({ user: state.user ? { ...state.user, ...profile } : state.user })),
    }),
    { name: "speednetrdc-auth" },
  ),
);
