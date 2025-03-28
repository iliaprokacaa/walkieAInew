"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useChatStore } from "@/store/chat-store"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatArea } from "@/components/chat/chat-area"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/chat/empty-state"

export default function ChatPage() {
  const { token, isLoading: authLoading } = useAuth()
  const { currentChat, chats, fetchChats, fetchChat, isLoading, setCurrentChat } = useChatStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("id")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
    }
  }, [token, authLoading, router])

  // Load chats and handle URL parameters
  useEffect(() => {
    let isSubscribed = true

    const initializeChats = async () => {
      if (!token) return

      try {
        // Only fetch the chats list for sidebar
        await fetchChats(token)
      } catch (error) {
        console.error("[ChatPage] Error in initialization:", error)
      }
    }

    if (!authLoading) {
      initializeChats()
    }

    return () => {
      isSubscribed = false
    }
  }, [token, authLoading, fetchChats])

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Show loading state while authentication or initial load is in progress
  if (authLoading || (isLoading && !currentChat)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : currentChat && currentChat.messages ? (
          <ChatArea 
            chat={{
              chatid: currentChat.chatid,
              chatname: currentChat.chatname,
              messages: currentChat.messages
            }} 
            onToggleSidebar={toggleSidebar} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState onToggleSidebar={toggleSidebar} />
          </div>
        )}
      </main>
    </div>
  )
}

