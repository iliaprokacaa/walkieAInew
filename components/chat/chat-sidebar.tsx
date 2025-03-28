"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, MessageSquare, User, LogOut, Trash, CreditCard, Coins} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/providers/auth-provider"
import { useChatStore, type Chat } from "@/store/chat-store"
import { CreateChatDialog } from "@/components/chat/create-chat-dialog"
import { ProfileModal } from "@/components/profile-modal"
import { SubscriptionModal } from "@/components/subscription/subscription-modal"
import { toast } from "react-hot-toast"
import { chatApi } from "@/lib/api"
import { cn, formatTimeLeft } from "@/lib/utils"

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const subscriptions = [
  { id: 1, name: 'Starter', price: 7.99, messages: 50 },
  { id: 2, name: 'Plus', price: 19.99, messages: 200 },
  { id: 3, name: 'Ultimate', price: 49.99, messages: 600 }
]

interface ChatResponse {
  success: boolean
  message?: string
  chatid?: string
  chatname?: string
  messages?: any[]
  created_at?: number
  updated_at?: number
}

interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  message?: string
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { user, token, logout } = useAuth()
  const { chats, currentChat, setCurrentChat, createChat, fetchChat, deleteChat } = useChatStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timeLeft, setTimeLeft] = useState<string>("")

  // Handle initial URL-based chat loading
  useEffect(() => {
    const chatId = searchParams.get("id")
    if (chatId && (!currentChat || currentChat.chatid !== chatId)) {
      handleChatSelect({ chatid: chatId } as Chat)
    }
  }, [searchParams])

  // Update subscription timer every second
  useEffect(() => {
    if (!user?.subscriptionexpiry) return;

    const updateTimer = () => {
      const expiryTimestamp = user.subscriptionexpiry;
      if (expiryTimestamp === null) return;
      
      // Ensure we're using the Unix timestamp correctly
      setTimeLeft(formatTimeLeft(expiryTimestamp));
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user?.subscriptionexpiry]);

  const handleChatSelect = async (chat: Chat) => {
    try {
      // Get token first
      const token = localStorage.getItem("token")
      if (!token) return

      // If we already have this chat loaded and it's current, just update URL
      if (currentChat?.chatid === chat.chatid) {
        if (searchParams.get("id") !== chat.chatid) {
          await router.replace(`/chat?id=${chat.chatid}`, { scroll: false })
        }
        return
      }

      // Set loading state
      setCurrentChat({ ...chat, messages: [] })

      // Fetch full chat data
      const fullChat = await fetchChat(chat.chatid, token)
      setCurrentChat(fullChat)

      // Update URL without scroll
      if (searchParams.get("id") !== chat.chatid) {
        await router.replace(`/chat?id=${chat.chatid}`, { scroll: false })
      }
    } catch (error) {
      console.error("Error fetching chat details:", error)
      toast.error("This chat no longer exists")
      // Clear current chat and URL on error
      setCurrentChat(null)
      router.replace("/chat", { scroll: false })
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    if (!token) return

    try {
      // Delete from server - the store handles optimistic updates
      await deleteChat(chatId, token);
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  }

  const handleCreateChat = async (chatName: string) => {
    if (!token) return

    try {
      // Create chat - the store handles optimistic updates
      const chatId = await createChat(chatName, token);
      
      // Close the dialog and sidebar
      setIsCreateDialogOpen(false);
      onToggle(); // Close the sidebar
      
      // Navigate to the new chat
      if (chatId) {
        router.push(`/chat?id=${chatId}`, { scroll: false });
      }
    } catch (error) {
      toast.error("Failed to create chat");
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: 10,
          currency: "USDT"
        })
      }).then(res => res.json()) as PaymentResponse

      if (response.success && response.paymentUrl) {
        toast.success("Redirecting to payment...")
        window.location.href = response.paymentUrl
      } else {
        toast.error(response.message || "Failed to process subscription")
      }
    } catch (error) {
      toast.error("Failed to process subscription")
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <div className="relative">
        <div
          className={`fixed top-0 left-0 z-40 h-full bg-secondary transform transition-transform duration-200 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: "16rem" }}
        >
          <div className="flex flex-col h-full">
            {isOpen && (
              <>
                <div className="p-4 flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New Chat
                  </Button>
                </div>

                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div key={chat.chatid} className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-left text-sm md:text-base",
                            chat.chatid === currentChat?.chatid && "bg-cyan-500/20 hover:bg-cyan-500/30"
                          )}
                          onClick={() => handleChatSelect(chat)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                          <span className="truncate">{chat.chatname}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDeleteChat(chat.chatid)}
                        >
                          <Trash className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* User data section - always at bottom */}
                <div className="mt-auto p-4 border-t border-white/10">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <User className="h-4 w-4 md:h-5 md:w-5" />
                      <span>{user?.username || 'Guest'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <svg className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                        <path d="M21 8C21 6.34315 17.866 5 14 5C10.134 5 7 6.34315 7 8M21 8V12C21 13.0195 19.8135 13.9202 18 14.4623C16.8662 14.8012 15.4872 15 14 15C12.5128 15 11.1338 14.8012 10 14.4623C8.18652 13.9202 7 13.0195 7 12V8M21 8C21 9.01946 19.8135 9.92016 18 10.4623C16.8662 10.8012 15.4872 11 14 11C12.5128 11 11.1338 10.8012 10 10.4623C8.18652 9.92016 7 9.01946 7 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                        <path d="M3 12.0001V16.0001C3 17.0196 4.18652 17.9203 6 18.4624C7.13383 18.8013 8.51275 19.0001 10 19.0001C11.4872 19.0001 12.8662 18.8013 14 18.4624C15.8135 17.9203 17 17.0196 17 16.0001V15.0001M3 12.0001C3 10.8034 4.63505 9.7703 7 9.28882M3 12.0001C3 13.0196 4.18652 13.9203 6 14.4624C7.13383 14.8013 8.51275 15.0001 10 15.0001C10.695 15.0001 11.3663 14.9567 12 14.8759" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                      </svg>
                      <span>Daily Credits: {user?.credits || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                      <span>Subscription: {user?.subscriptionid === 1 ? 'Starter' :
                                         user?.subscriptionid === 2 ? 'Plus' :
                                         user?.subscriptionid === 3 ? 'Ultimate' :
                                         'Free'}</span>
                    </div>
                    {timeLeft && (
                      <div className="text-xs md:text-sm text-muted-foreground ml-6">
                        {timeLeft}
                      </div>
                    )}
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm md:text-base"
                        onClick={() => setIsProfileModalOpen(true)}
                      >
                        <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm md:text-base"
                        onClick={() => setIsSubscriptionModalOpen(true)}
                      >
                        <CreditCard className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Buy Subscription
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm md:text-base text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {!isOpen && (
          <Button 
            className="fixed top-4 left-4 z-50 h-8 w-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white" 
            onClick={onToggle}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onToggle}
      />

      <CreateChatDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateChat={handleCreateChat}
      />

      <ProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />

      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />
    </>
  )
}

