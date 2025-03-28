import { toast } from 'react-hot-toast'
import { type Chat } from "@/store/chat-store"

const BASE_URL = "https://api.walkie-ai.com"

type ApiOptions = {
  method?: string
  body?: any
  token?: string | null
  isSSE?: boolean
  signal?: AbortSignal
}

const isAuthEndpoint = (endpoint: string): boolean => {
  return endpoint.includes("/login") ||
    endpoint.includes("/register") ||
    endpoint.includes("/resetpassword") ||
    endpoint.includes("/resetpassword/confirm") ||
    endpoint.includes("/verify-email")
}

const shouldShowToast = (endpoint: string): boolean => {
  // Don't show toasts for image generation endpoint
  if (endpoint.includes("/image/generation")) {
    return false
  }
  return true
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, isSSE = false, signal } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })

    if (isSSE) {
      return response as unknown as T
    }

    const data = await response.json()

    // Handle status codes
    if (response.status === 500) {
      toast.error("Internal server error. Please try again later.")
      return data as T
    }

    if (response.status === 400) {
      return data as T
    }

    if (response.status === 200) {
      // Only show success toast for auth endpoints
      if (isAuthEndpoint(endpoint) && data.success && data.message) {
        toast.success(data.message)
      }
      return data as T
    }

    // For other status codes, just return the data
    return data as T
  } catch (error: any) {
    // Don't show error toast for aborted requests
    if (error.name === 'AbortError') {
      throw error;
    }

    const message = error instanceof Error 
      ? error.message 
      : "Failed to connect to the server. Please check your internet connection."
    
    toast.error(message)
    return { success: false, message } as T
  }
}

// Authentication API calls
export const authApi = {
  register: (data: { username: string; email: string; password: string; hcaptcha: string }) =>
    apiRequest("/register", { method: "POST", body: data }),

  login: (data: { username: string; password: string; hcaptcha: string }) =>
    apiRequest<{ success: boolean; token?: string; message?: string }>("/login", { method: "POST", body: data }),

  verifyEmail: (token: string) => apiRequest("/verify-email", { method: "POST", body: { token } }),

  resendVerification: (data: { email: string; hcaptcha: string }) =>
    apiRequest("/resend-verification", { method: "POST", body: data }),

  resetPassword: (data: { email: string; hcaptcha: string }) =>
    apiRequest("/resetpassword", { method: "POST", body: data }),

  confirmResetPassword: (data: { token: string; newPassword: string }) =>
    apiRequest("/resetpassword/confirm", { method: "POST", body: data }),

  getProfile: (token: string) => apiRequest("/me", { token }),

  changePassword: (data: { oldpassword: string; newpassword: string }, token: string) =>
    apiRequest<{ success: boolean; message?: string }>("/change/password", { method: "POST", body: data, token }),

  changeUsername: (data: { username: string }, token: string) =>
    apiRequest<{ success: boolean; message?: string }>("/change/username", { method: "POST", body: data, token }),
}

export const subscriptionApi = {
  buySubscription: (data: { subscriptionid: number; crypto: string; type: "monthly" | "yearly" }, token: string) =>
    apiRequest<{
      success: boolean;
      details?: {
        orderid: string;
        amount: string;
        address: string;
        network: string;
        crypto: string;
        qr: string;
        subscription: string;
      };
    }>("/buysubscription", { method: "POST", body: data, token }),

  checkPaymentStatus: (orderId: string, token: string) =>
    apiRequest<{
      success: boolean;
      status: "Waiting" | "Paid" | "Processed";
      message: string;
    }>(`/payment/status/${orderId}`, { method: "GET", token }),
}

// Chat API calls
export const chatApi = {
  createChat: (data: { chatname: string }, token: string) =>
    apiRequest<{ success: boolean; chat: Chat }>("/chat/create", { method: "POST", body: data, token }),

  listChats: (token: string) => apiRequest("/chats", { token }),

  getChat: (chatId: string, token: string) => 
    apiRequest<{ success: boolean; chat: Chat }>(`/chat/${chatId}`, { token }),

  deleteChat: (chatId: string, token: string) => apiRequest(`/chat/${chatId}`, { method: "DELETE", token }),

  sendMessage: (chatId: string, data: any, token: string, signal?: AbortSignal) =>
    apiRequest(`/chat/${chatId}/message`, { method: "POST", body: data, token, isSSE: true, signal }),

  generateImage: (data: { model: string; prompt: string; safetychecker: boolean; chatid: string }, token: string) =>
    apiRequest("/image/generation", { method: "POST", body: data, token }),

  uploadFile: async (file: File, token: string) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data: { success: boolean; message: string; url: string } = await response.json()
    return data
  }
}

// Payment API calls
export const paymentApi = {
  buyCredits: (data: { amount: number; crypto: string }, token: string) =>
    apiRequest("/buycredits", { method: "POST", body: data, token }),

  checkPaymentStatus: (orderId: string, token: string) => apiRequest(`/payment/status/${orderId}`, { token }),
}

