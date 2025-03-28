"use client"

import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { Bot, AlertTriangle, Upload, ZoomIn, Download, FileText, File as FileIcon, ArrowDown, Send } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useChatStore, type Chat, type Message } from "@/store/chat-store"
import { useSettingsStore, type Provider } from "@/store/settings-store"
import { ModelSelectionDialog } from "./model-selection-dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import { chatApi } from "@/lib/api"

interface ChatWithRequired extends Omit<Chat, 'messages'> {
  chatid: string;
  messages: Message[];
  chatname: string;
}

interface ChatAreaProps {
  chat: Chat;
  onToggleSidebar: () => void;
}

interface MessagePayload {
  chatid: string;
  content: string | Array<{
    type: string;
    image_url: {
      url: string;
    };
  }>;
  provider: Provider;
  model: string;
  file?: string;
  file_type?: string;
}

// Simplified message component with basic markdown handling
const ChatMessage = React.memo(({ message }: { message: Message }) => {
  const content = typeof message.content === 'string' ? message.content : '';
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const fileUrl = message.file || message.image;
  const isImageFile = fileUrl?.startsWith('data:image/') || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const getFileIcon = (url: string) => {
    if (url.startsWith('data:')) {
      const mimeType = url.split(':')[1].split(';')[0];
      if (mimeType.startsWith('application/pdf')) return FileText;
      if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) return FileText;
      return FileIcon;
    }
    
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return FileText;
    if (['doc', 'docx'].includes(extension || '')) return FileText;
    return FileIcon;
  };

  const formatTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const downloadFile = async (fileUrl: string) => {
    try {
      if (fileUrl.startsWith('data:')) {
        // Handle data URLs directly
        const [header, base64Data] = fileUrl.split(',')
        const mimeType = header.split(':')[1].split(';')[0]
        const binaryData = atob(base64Data)
        const array = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i)
        }
        const blob = new Blob([array], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const extension = mimeType.split('/')[1]
        link.download = message.fileName || `file-${Date.now()}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Handle regular URLs
        const response = await fetch(fileUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const filename = message.fileName || fileUrl.split('/').pop() || `file-${Date.now()}`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Get the last part of the path (filename)
      const filename = pathname.split('/').pop();
      // If filename exists and has an extension, return it
      if (filename && filename.includes('.')) {
        return decodeURIComponent(filename);
      }
      // Fallback to showing the last 20 characters of the URL
      return decodeURIComponent(pathname.slice(-20));
    } catch (e) {
      // If URL parsing fails, return last part of the string after last slash
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    }
  };

  if (message.role === 'error') {
    return (
      <div className="mb-6 max-w-[85%] lg:max-w-[90%] mx-auto">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/20 text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 max-w-[800px] mx-auto">
      <div className={cn(
        "flex flex-col gap-2",
        message.role === 'user' ? "items-end" : "items-start"
      )}>
        {isAndroid && (
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            message.role === 'user' 
              ? "bg-blue-500/20 text-blue-500" 
              : "bg-cyan-500/20 text-cyan-500"
          )}>
            {message.role === 'user' ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </div>
        )}

        <div className={cn(
          "flex flex-col gap-2 min-w-0 max-w-[95%]",
          message.role === 'user' ? "items-end" : "items-start"
        )}>
          {fileUrl && (
            <div className="max-w-full">
              {isImageFile ? (
                <div className="relative group max-w-[400px]">
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                  <img 
                    src={fileUrl} 
                    alt={content}
                    className="rounded-lg max-h-[400px] w-auto object-contain cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  <Lightbox
                    open={isLightboxOpen}
                    close={() => setIsLightboxOpen(false)}
                    slides={[{ src: fileUrl }]}
                    plugins={[Zoom]}
                    render={{
                      buttonPrev: () => null,
                      buttonNext: () => null,
                    }}
                    toolbar={{
                      buttons: [
                        'close',
                        <button
                          key="download"
                          type="button"
                          className="yarl__button"
                          onClick={() => downloadFile(fileUrl)}
                          title="Download image"
                        >
                          <Download className="yarl__icon" />
                        </button>
                      ]
                    }}
                    animation={{ fade: 300 }}
                    carousel={{
                      finite: true,
                      preload: 1,
                      padding: "16px",
                      spacing: "30%",
                    }}
                    styles={{
                      container: { backgroundColor: "rgba(0, 0, 0, .95)" },
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => downloadFile(fileUrl)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <span className="text-blue-500 break-all text-left">
                    {message.fileName || getFileNameFromUrl(fileUrl)}
                  </span>
                  <Download className="h-4 w-4 text-blue-500 shrink-0" />
                </button>
              )}
            </div>
          )}
          
          <div className={cn(
            "px-4 py-3 rounded-lg relative group",
            message.role === 'user' 
              ? "bg-blue-500/5 text-[15px] sm:text-[16px]" 
              : "bg-cyan-500/20 text-[14px] sm:text-[15px]"
          )}>
            <CopyButton 
              value={content} 
              className={cn(
                "absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 hover:bg-white/10 rounded",
                message.role === 'user' ? "hover:bg-blue-500/10" : "hover:bg-cyan-500/10"
              )}
            />
            {message.role === 'user' ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1({children}) {
                    return <h1 className="text-xl font-semibold mb-4 mt-6 text-white/90">{children}</h1>
                  },
                  h2({children}) {
                    return <h2 className="text-lg font-semibold mb-3 mt-5 text-white/90">{children}</h2>
                  },
                  h3({children}) {
                    return <h3 className="text-base font-semibold mb-2 mt-4 text-white/90">{children}</h3>
                  },
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    const language = match ? match[1] : ''
                    const content = String(children).replace(/\n$/, '')
                    const lines = content.split('\n').length
                    const isShort = lines <= 3 && content.length < 100

                    if (!inline && language && !isShort) {
                      return (
                        <div className="relative group my-4 overflow-hidden rounded-lg border border-white/10 bg-black/30 max-w-[650px]">
                          <div className="flex items-center justify-between px-4 py-2 bg-white/5">
                            <div className="text-xs text-cyan-500 font-mono uppercase">{language}</div>
                            <CopyButton value={content} className="h-6 w-6 hover:bg-white/10 rounded transition-colors" />
                          </div>
                          <SyntaxHighlighter
                            language={language}
                            style={vscDarkPlus}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              background: 'transparent',
                              padding: '1rem',
                              fontSize: '13px',
                              lineHeight: '1.4',
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                            wrapLongLines={true}
                          >
                            {content}
                          </SyntaxHighlighter>
                        </div>
                      )
                    }

                    return (
                      <code className="bg-black/50 text-white-300 px-2 py-0.5 rounded font-mono text-[13px] whitespace-pre-wrap">
                        {content}
                      </code>
                    )
                  },
                  p({children}) {
                    return <p className="mb-3 last:mb-0 whitespace-pre-wrap leading-relaxed text-white/90">{children}</p>
                  },
                  ul({children}) {
                    return <ul className="list-none mb-3 last:mb-0 text-white/90">{children}</ul>
                  },
                  ol({children, start}) {
                    return <ol className="list-none mb-3 last:mb-0 text-white/90" start={start}>{children}</ol>
                  },
                  li({children, ordered, index}) {
                    return <li className="flex items-start gap-2 leading-relaxed text-white/90">
                      <span className="select-none min-w-[1rem] text-right">
                        {ordered ? `${index}.` : '•'}
                      </span>
                      <span>{children}</span>
                    </li>
                  },
                  blockquote({children}) {
                    return <blockquote className="border-l-4 border-cyan-500/50 pl-4 my-4 italic text-white/80">{children}</blockquote>
                  },
                  hr() {
                    return <hr className="my-4 border-t border-cyan-500/20" />
                  },
                  a({href, children}) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {children}
                      </a>
                    )
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>

          {message.timestamp && (
            <div className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground/80",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}>
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage'

const ChatArea: React.FC<ChatAreaProps> = memo(function ChatArea({ chat, onToggleSidebar }) {
  const { user, token, refreshUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const isInitialLoad = useRef(true)

  const lastStatusRef = useRef<number>(Date.now())
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const isConnectingRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Subscribe to store state with memoization
  const currentChat = useChatStore(useCallback(state => state.currentChat, []))
  const messages = useChatStore(useCallback(state => state.currentChat?.messages || [], []))
  const addMessageToCurrentChat = useChatStore(useCallback(state => state.addMessageToCurrentChat, []))
  const updateLastAssistantMessage = useChatStore(useCallback(state => state.updateLastAssistantMessage, []))
  const addErrorMessage = useChatStore(useCallback(state => state.addErrorMessage, []))

  const settings = useSettingsStore()
  const selectedModel = useMemo(() => ({
    provider: settings.provider,
    model: settings.model
  }), [settings.provider, settings.model])

  // Check if chat is deleted or not selected
  const isChatDeleted = !currentChat

  // Add new state for user scroll control
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Enhanced scroll to bottom function with RAF wrapper
  const scrollToBottomWithRAF = useCallback((force: boolean = false) => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current && (force || !userHasScrolled)) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });
  }, [userHasScrolled]);

  const scrollToBottom = useCallback((force: boolean = false) => {
    if (chatContainerRef.current && (force || !userHasScrolled)) {
      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [userHasScrolled]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Show button only when scrolled up more than 300px from bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isSignificantlyScrolledUp = distanceFromBottom > 300;
    
    setUserHasScrolled(!isSignificantlyScrolledUp);
    setShowScrollButton(isSignificantlyScrolledUp);
  }, []);

  // Reset user scroll when changing chats
  useEffect(() => {
    setUserHasScrolled(false);
    setShowScrollButton(false);
    scrollToBottom(true);
  }, [currentChat?.chatid]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (chatContainerRef.current) {
      scrollToBottom(true);
    }
  }, []);

  // Update the WebSocket message handler
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      // Check for plain text "connected" message
      if (event.data === "connected") {
        lastStatusRef.current = Date.now()
        return
      }

      // Check for plain text authentication response
      if (event.data === "true") {
        setIsConnected(true)
        isConnectingRef.current = false
        return
      }

      if (event.data === "false") {
        toast.error("Authentication failed")
        setIsConnected(false)
        isConnectingRef.current = false
        wsRef.current?.close()
        return
      }

      // Try to parse JSON data for other messages
      const data = JSON.parse(event.data)

      if (data.success === false) {
        toast.error(data.message || 'An error occurred')
        setIsStreaming(false)
        wsRef.current?.close()
        return
      }

      if (data.content) {
        if (data.content === '[DONE]') {
          setIsStreaming(false)
          refreshUser()
          return
        }

        const currentMessages = useChatStore.getState().currentChat?.messages || []
        const lastMessage = currentMessages[currentMessages.length - 1]
        const timestamp = data.timestamp || Date.now()

        if (!lastMessage || lastMessage.role === 'user') {
          addMessageToCurrentChat({
            role: 'assistant',
            content: data.content,
            timestamp,
            file: data.file,
            image: data.file,
            fileName: data.fileName
          })
          setIsStreaming(true)
        } else if (lastMessage.role === 'assistant') {
          updateLastAssistantMessage({
            role: 'assistant',
            content: lastMessage.content + data.content,
            timestamp,
            file: data.file || lastMessage.file,
            image: data.file || lastMessage.image,
            fileName: data.fileName || lastMessage.fileName
          })
        }

        scrollToBottomWithRAF()
      } else if (data.type === 'error') {
        toast.error(data.error || 'An error occurred')
        setIsStreaming(false)
        wsRef.current?.close()
        refreshUser()
      }
    } catch (error) {
      console.error('Error in WebSocket message handler:', error)
      toast.error('Failed to process response')
      setIsStreaming(false)
      wsRef.current?.close()
      refreshUser()
    }
  }, [addMessageToCurrentChat, updateLastAssistantMessage, refreshUser, scrollToBottomWithRAF])

  // Connect WebSocket
  const connect = useCallback(() => {
    if (!token || wsRef.current || isConnectingRef.current) return

    try {
      isConnectingRef.current = true
      const socket = new WebSocket('wss://chat.walkie-ai.com')
      wsRef.current = socket

      socket.onopen = () => {
        // Send token as plain text
        socket.send(token)
      }

      socket.onmessage = handleWebSocketMessage

      socket.onclose = () => {
        wsRef.current = null
        setIsConnected(false)
        isConnectingRef.current = false
        
        if (!wsRef.current && !isConnectingRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 1000)
        }
      }

      socket.onerror = () => socket.close()

    } catch (error) {
      console.error('Error creating WebSocket:', error)
      isConnectingRef.current = false
      
      if (!wsRef.current && !isConnectingRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, 1000)
      }
    }
  }, [token, handleWebSocketMessage])

  // Connect on mount and handle cleanup
  useEffect(() => {
    if (!wsRef.current && !isConnectingRef.current) {
      connect()
    }
    
    const checkConnection = setInterval(() => {
      const timeSinceLastStatus = Date.now() - lastStatusRef.current
      if (timeSinceLastStatus > 5000 && wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('No "connected" message received for 5 seconds, reconnecting...')
        wsRef.current.close()
      }
    }, 5000)
    
    return () => {
      clearInterval(checkConnection)
      clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current && !document.querySelector('[data-chat-container]')) {
        wsRef.current.close()
        wsRef.current = null
        isConnectingRef.current = false
      }
    }
  }, [connect])

  // Handle message sending
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pendingFileData, setPendingFileData] = useState<{
    url: string;
    fileName: string;
    type: string;
  } | null>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!token) {
      toast.error("Please log in to upload files")
      return
    }
    
    // Check file type
    const validTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    const validExtensions = ['.txt']
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("Please upload only images, documents, or text files")
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB")
      return
    }

    try {
      const data = await chatApi.uploadFile(file, token)

      if (!data.success) {
        toast.error(data.message || "Failed to upload file")
        return
      }

      // Store the file data and wait for user input
      setPendingFileData({
        url: data.url,
        fileName: file.name,
        type: file.type || 'text/plain'
      })
      
      // Clear the input
      e.target.value = ''
      toast.success("File attached")
      scrollToBottom(true) // Force scroll to bottom after file attach
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error("Failed to upload file")
    }
  }, [token, chatApi]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user) {
      toast.error("Please log in to continue")
      return
    }

    if (!settings.model) {
      toast.error("Please select a chat model first")
      return
    }

    if (!currentChat) {
      toast.error("No chat selected")
      return
    }

    // Show error if trying to send file without caption
    if (pendingFileData && !content.trim()) {
      toast.error("Please add a caption for the file")
      return
    }

    try {
      setIsLoading(true)
      setIsStreaming(true)

      // If there's a pending file, send it with the user's caption
      if (pendingFileData) {
        // Store file URL and original filename with user's caption
        addMessageToCurrentChat({
          role: 'user',
          content: content.trim(),
          timestamp: Date.now(),
          file: pendingFileData.url,
          image: pendingFileData.url,
          fileName: pendingFileData.fileName
        })

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          toast.error("Connection lost")
          return
        }

        wsRef.current.send(JSON.stringify({
          chatid: currentChat.chatid,
          content: content.trim(),
          provider: selectedModel.provider,
          model: selectedModel.model,
          file: pendingFileData.url,
          file_type: pendingFileData.type,
        }))

        // Clear the pending file data
        setPendingFileData(null)
      } else {
        // Normal text message without file
        addMessageToCurrentChat({
          role: 'user',
          content,
          timestamp: Date.now()
        })

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          toast.error("Connection lost")
          return
        }

        wsRef.current.send(JSON.stringify({
          chatid: currentChat.chatid,
          content,
          provider: selectedModel.provider,
          model: selectedModel.model,
        }))
      }

      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Connection lost")
      setIsStreaming(false)
    } finally {
      setIsLoading(false)
      setInputMessage("")
    }
  }, [user, settings.model, currentChat, selectedModel, addMessageToCurrentChat, scrollToBottom, pendingFileData])

  // Handle abort
  const handleAbort = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      
      addMessageToCurrentChat({
        role: 'error',
        content: 'User aborted request.',
        timestamp: Date.now()
      })

      scrollToBottomWithRAF()
      setIsStreaming(false)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        isConnectingRef.current = false
        connect()
      }, 100)
    }
  }, [connect, addMessageToCurrentChat, scrollToBottomWithRAF])

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  // Add visual indicator for pending file
  const renderPendingFileIndicator = () => {
    if (!pendingFileData) return null;
    
    return (
      <div className="absolute left-16 bottom-full mb-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-sm flex items-center gap-2">
        <Upload className="h-4 w-4" />
        <span className="truncate max-w-[200px]">{pendingFileData.fileName}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            setPendingFileData(null);
          }}
          className="ml-1 p-0.5 hover:bg-white/10 rounded"
          title="Remove file"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  // Add screen size hook
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Update screen size check
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileScreen(window.innerWidth <= 640); // 640px is our sm: breakpoint
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleScrollToBottom = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    scrollToBottom(true);
  }, [scrollToBottom]);

  if (!user) return null

  if (isChatDeleted) {
    return (
      <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">No chat selected</p>
          </div>
        </div>
      </div>
    )
  }

  // Memoize the message list
  const messageList = useMemo(() => (
    <div className="flex-1 overflow-y-auto px-4 py-2" onScroll={handleScroll}>
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.role}-${message.timestamp || Date.now()}`}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  ), [messages, handleScroll]);

  // Memoize the input area
  const inputArea = useMemo(() => (
    <div className="flex items-center gap-2 p-4 border-t">
      {renderPendingFileIndicator()}
      <div className="flex gap-2">
        <textarea
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(200, e.target.scrollHeight) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (inputMessage.trim()) {
                handleSendMessage(inputMessage.trim());
                setInputMessage("");
                e.currentTarget.style.height = '46px';
              }
            }
          }}
          placeholder="Type a message..."
          className="flex-1 min-h-[46px] max-h-[200px] p-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          onClick={() => {
            if (inputMessage.trim()) {
              handleSendMessage(inputMessage.trim());
              setInputMessage("");
            }
          }}
          className="h-10 w-10 p-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  ), [inputMessage, pendingFileData, handleFileUpload, handleSendMessage]);

  return (
    <div className="flex flex-col h-full">
      {messageList}
      {inputArea}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className="fixed bottom-20 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
});

export default ChatArea;



