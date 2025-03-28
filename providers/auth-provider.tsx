"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "react-hot-toast"

type User = {
  userid: number
  username: string
  email: string
  credits: number
  registerdate: number
  messageCount: number
  messageLimit: number
  subscriptionid: number
  subscriptionexpiry: number | null
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Load token from localStorage on initial mount
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserProfile(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Redirect logic based on authentication state
    if (!isLoading) {
      // Skip auth check completely for legal pages
      if (pathname.startsWith("/terms") || pathname.startsWith("/privacy")) {
        return;
      }

      const publicRoutes = ["/", "/login", "/register", "/verify-email", "/reset-password"]
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

      // Get current URL parameters
      const currentUrl = new URL(window.location.href)
      const chatId = currentUrl.searchParams.get("id")
      
      if (!token && !isPublicRoute && pathname !== "/") {
        // Preserve chat ID when redirecting to login
        if (chatId) {
          router.replace(`/login?id=${chatId}`)
        } else {
          router.replace("/login")
        }
      } else if (token && isPublicRoute && pathname !== "/") {
        // Preserve chat ID when redirecting to chat page
        if (chatId) {
          router.replace(`/chat?id=${chatId}`)
        } else {
          router.replace("/chat")
        }
      }
    }
  }, [token, isLoading, pathname, router])

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch("https://api.walkie-ai.com/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setUser(data)
      } else {
        // Token is invalid or expired
        logout()
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    fetchUserProfile(newToken)
    toast.success("Logged in successfully")
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    router.push("/login")
    toast.success("Logged out successfully")
  }

  const refreshUser = async () => {
    if (!token) {
      toast.error("You are not logged in.")
      return
    }

    try {
      const response = await fetch("https://api.walkie-ai.com/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setUser(data)
      } else {
        logout()
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

