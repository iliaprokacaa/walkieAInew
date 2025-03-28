"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

const formSchema = z.object({
  chatName: z
    .string()
    .min(1, "Chat name is required")
    .max(32, "Chat name must be 32 characters or less")
    .regex(/^[a-zA-Z0-9]+$/, "Chat name can only contain Latin letters and numbers"),
})

interface CreateChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateChat: (chatName: string) => void
}

export function CreateChatDialog({ open, onOpenChange, onCreateChat }: CreateChatDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatName: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await onCreateChat(values.chatName)
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create chat"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] w-[330px] p-4 sm:p-6 rounded-lg bg-gradient-to-b from-background to-background/80 border-cyan-500/20">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-base sm:text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Create New Chat</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">Give your chat a name to identify it later.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="chatName"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs sm:text-sm">Chat Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My new chat" 
                      className="h-8 sm:h-9 text-xs sm:text-sm bg-cyan-950/20 border-cyan-500/20 focus:border-cyan-500/40" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] sm:text-xs text-red-500" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-1 sm:pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="sm"
                className="w-full sm:w-auto h-8 text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isSubmitting ? "Creating..." : "Create Chat"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

