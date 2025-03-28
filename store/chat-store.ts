import { create } from "zustand"
import { chatApi } from "@/lib/api"

export type Message = {
  role: "assistant" | "user" | "error"
  content: string
  timestamp: number
  image?: string
  file?: string
  fileName?: string
  seed?: string
  url?: string
  base64_url?: string
  prompt?: string
}

export type Chat = {
  chatid: string
  chatname: string
  messages?: Message[]
  created_at?: number
  updated_at?: number
}

type ChatState = {
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchChats: (token: string) => Promise<Chat[]>
  fetchChat: (chatId: string, token: string) => Promise<Chat>
  createChat: (chatname: string, token: string) => Promise<string>
  deleteChat: (chatId: string, token: string) => Promise<void>
  setCurrentChat: (chat: Chat | null) => void
  addMessageToCurrentChat: (message: Message) => void
  updateLastAssistantMessage: (message: Message) => void
  addErrorMessage: (content: string) => void
}

type ChatResponse = {
  success: boolean
  chats: Chat[]
  message?: string
}

type SingleChatResponse = {
  success: boolean
  chat: Chat
  message?: string
}

type CreateChatResponse = {
  success: boolean
  chat?: Chat
  message?: string
}

type SetState = {
  (partial: ChatState | Partial<ChatState> | ((state: ChatState) => ChatState | Partial<ChatState>), replace?: false): void
  (state: ChatState | ((state: ChatState) => ChatState), replace: true): void
}

type GetState = () => ChatState

export const useChatStore = create<ChatState>((set: SetState, get: GetState) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,

  fetchChats: async (token: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await chatApi.listChats(token) as ChatResponse
      const chats = response.chats.map(chat => ({
        ...chat,
        messages: chat.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? 
            (msg.timestamp > 9999999999 ? msg.timestamp : msg.timestamp * 1000) : 
            Date.now()
        }))
      }))
      set({ chats, isLoading: false })
      return chats
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch chats",
        isLoading: false,
      })
      throw error
    }
  },

  fetchChat: async (chatId: string, token: string) => {
    try {
      console.log("[ChatStore] Fetching chat:", chatId)
      set({ isLoading: true })
      
      const response = await fetch(`https://api.walkie-ai.com/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[ChatStore] Chat fetch response status:", response.status)
      const data = await response.json()
      console.log("[ChatStore] Chat fetch response:", {
        success: data.success,
        hasData: !!data.chat
      })

      if (!data.success) {
        console.error("[ChatStore] Chat fetch failed:", data.message)
        throw new Error(data.message || "Failed to fetch chat")
      }

      if (!data.chat) {
        console.error("[ChatStore] Chat data missing in response")
        throw new Error("Chat not found")
      }

      return data.chat
    } catch (error) {
      console.error("[ChatStore] Error in fetchChat:", error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  createChat: async (chatname: string, token: string) => {
    set({ isLoading: true, error: null })
    try {
      // Create optimistic chat
      const optimisticChat: Chat = {
        chatid: `temp-${Date.now()}`,
        chatname,
        messages: [],
        created_at: Date.now(),
        updated_at: Date.now()
      }

      // Optimistically update UI
      set((state: ChatState) => ({
        chats: [...state.chats, optimisticChat],
        currentChat: optimisticChat,
        isLoading: false,
      }))

      // Make API call
      const response = await chatApi.createChat({ chatname }, token) as CreateChatResponse
      
      if (response.success === false) {
        // Revert optimistic update on error
        set((state: ChatState) => ({
          chats: state.chats.filter(chat => chat.chatid !== optimisticChat.chatid),
          currentChat: null,
          isLoading: false,
        }))
        throw new Error(response.message || "Failed to create chat")
      }
      
      const newChat = (response.chat || response) as Chat
      
      if (!newChat?.chatid) {
        // Revert optimistic update on error
        set((state: ChatState) => ({
          chats: state.chats.filter(chat => chat.chatid !== optimisticChat.chatid),
          currentChat: null,
          isLoading: false,
        }))
        throw new Error("Invalid chat data received from server")
      }

      // Update with real data
      set((state: ChatState) => ({
        chats: state.chats.map(chat => 
          chat.chatid === optimisticChat.chatid ? newChat : chat
        ),
        currentChat: newChat,
        isLoading: false,
      }))
      return newChat.chatid
    } catch (error: any) {
      set({ isLoading: false })
      if (error.success === false) {
        throw new Error(error.message || "Failed to create chat")
      }
      throw new Error(error.message || "Failed to create chat")
    }
  },

  deleteChat: async (chatId: string, token: string) => {
    set({ isLoading: true, error: null })
    let chatToDelete: Chat | undefined
    try {
      // Store chat data for potential rollback
      chatToDelete = get().chats.find(chat => chat.chatid === chatId)
      if (!chatToDelete) return

      // Optimistically update UI
      set((state: ChatState) => ({
        chats: state.chats.filter(chat => chat.chatid !== chatId),
        currentChat: state.currentChat?.chatid === chatId ? null : state.currentChat,
        isLoading: false,
      }))

      // Delete from server
      await chatApi.deleteChat(chatId, token)
    } catch (error) {
      // Revert optimistic update on error
      if (chatToDelete) {
        set((state: ChatState) => ({
          chats: [...state.chats, chatToDelete as Chat],
          currentChat: state.currentChat?.chatid === chatId ? chatToDelete as Chat : state.currentChat,
          isLoading: false,
        }))
      }
      set({
        error: error instanceof Error ? error.message : "Failed to delete chat",
        isLoading: false,
      })
      throw error
    }
  },

  setCurrentChat: (chat: Chat | null) => {
    set({ currentChat: chat })
  },

  addMessageToCurrentChat: (message: Message) => {
    console.log('=== Adding new message ===')
    console.log('Message to add:', message)
    set((state: ChatState) => {
      console.log('Current state:', state)
      if (!state.currentChat) {
        console.log('No current chat found')
        return state
      }

      const currentMessages = state.currentChat.messages || [];
      console.log('Current messages:', currentMessages)

      // Ensure timestamp is in milliseconds
      const timestamp = message.timestamp ? 
        (message.timestamp > 9999999999 ? message.timestamp : message.timestamp * 1000) :
        Date.now();

      const updatedChat = {
        ...state.currentChat,
        messages: [...currentMessages, { ...message, timestamp }],
        updated_at: Date.now(),
      }
      console.log('Updated chat:', updatedChat)

      const newState = {
        ...state,
        currentChat: updatedChat,
        chats: state.chats.map((chat: Chat) => (chat.chatid === updatedChat.chatid ? updatedChat : chat)),
      }
      console.log('New state:', newState)
      return newState
    })
  },

  updateLastAssistantMessage: (message: Message) => {
    console.log('=== Updating last message ===')
    console.log('Message update:', message)
    set((state) => {
      console.log('Current state:', state)
      if (!state.currentChat?.messages?.length) {
        console.log('No messages to update')
        return state;
      }

      const messages = [...state.currentChat.messages];
      const lastMessage = messages[messages.length - 1];
      console.log('Current last message:', lastMessage)
      
      // Only update if last message is from assistant
      if (lastMessage.role !== 'assistant') {
        console.log('Last message not from assistant, skipping update')
        return state;
      }

      // Ensure timestamp is in milliseconds
      const timestamp = message.timestamp ? 
        (message.timestamp > 9999999999 ? message.timestamp : message.timestamp * 1000) :
        Date.now();

      // Update the message
      messages[messages.length - 1] = { ...message, timestamp };
      console.log('Updated messages array:', messages)

      const newState = {
        ...state,
        currentChat: {
          ...state.currentChat,
          messages
        }
      };
      console.log('New state:', newState)
      return newState;
    });
  },

  addErrorMessage: (content: string) => {
    set((state: ChatState) => {
      if (!state.currentChat) return state

      const errorMessage: Message = {
        role: "error",
        content,
        timestamp: Date.now(),
      }

      const updatedChat = {
        ...state.currentChat,
        messages: [...(state.currentChat.messages || []), errorMessage],
        updated_at: Date.now(),
      }

      return {
        currentChat: updatedChat,
        chats: state.chats.map((chat: Chat) => (chat.chatid === updatedChat.chatid ? updatedChat : chat)),
      }
    })
  },
}))

