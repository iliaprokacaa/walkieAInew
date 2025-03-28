"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MessageSquarePlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useChatStore } from "@/store/chat-store"
import { CreateChatDialog } from "./create-chat-dialog"

interface EmptyStateProps {
  onToggleSidebar?: () => void
}

export function EmptyState({ onToggleSidebar }: EmptyStateProps) {
  const { token } = useAuth()
  const { createChat, setCurrentChat, chats, fetchChat } = useChatStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCreateChat = async (chatName: string) => {
    if (!token) return

    try {
      const chatId = await createChat(chatName, token)

      // Find the newly created chat in the chats array
      const newChat = chats.find((chat) => chat.chatid === chatId)
      if (newChat) {
        // Set it as the current chat
        setCurrentChat(newChat)

        // Also fetch the full chat data
        await fetchChat(chatId, token)
      }

      // Only push new URL if we're not already on this chat
      if (searchParams.get("id") !== chatId) {
        router.push(`/chat?id=${chatId}`, { scroll: false })
      }
      setIsCreateDialogOpen(false)
      if (onToggleSidebar) onToggleSidebar() // Close the sidebar if prop is provided
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <MessageSquarePlus className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Chat Selected</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Create a new chat to start a conversation with one of our AI models.
      </p>
      <Button 
        onClick={() => setIsCreateDialogOpen(true)}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm"
        size="sm"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Create New Chat
      </Button>

      <CreateChatDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateChat={handleCreateChat}
      />
    </div>
  )
}

