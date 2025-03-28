"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/providers/auth-provider"
import { authApi } from "@/lib/api"
import { formatDate, formatCredits } from "@/lib/utils"
import { toast } from "react-hot-toast"

const usernameFormSchema = z.object({
  username: z.string().min(3).max(20),
})

const passwordFormSchema = z
  .object({
    oldpassword: z.string().min(1, "Current password is required"),
    newpassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => !val.includes(" "), "Password cannot contain spaces"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newpassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, token, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("account")

  const usernameForm = useForm<z.infer<typeof usernameFormSchema>>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      username: "",
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldpassword: "",
      newpassword: "",
      confirmPassword: "",
    },
  })

  const onUsernameSubmit = async (values: z.infer<typeof usernameFormSchema>) => {
    if (!token) return

    try {
      const response = await authApi.changeUsername({ username: values.username }, token)
      if (response.success) {
        await refreshUser()
        usernameForm.reset()
        onOpenChange(false)
        toast.success("Username updated successfully")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change username"
      usernameForm.setError("username", { message: errorMessage })
      toast.error(errorMessage)
    }
  }

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!token) return

    try {
      await authApi.changePassword(
        {
          oldpassword: values.oldpassword,
          newpassword: values.newpassword,
        },
        token,
      )

      passwordForm.reset()
      toast.success("Password updated successfully")
    } catch (error: any) {
      const errorMessage = error.message 
        ? error.message 
        : error.response?.message || "Failed to change password. Please try again."
      
      toast.error(errorMessage)

      if (errorMessage.toLowerCase().includes("current") || errorMessage.toLowerCase().includes("old")) {
        passwordForm.setError("oldpassword", { message: errorMessage })
      } else {
        passwordForm.setError("newpassword", { message: errorMessage })
      }
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-gradient-to-b from-background to-background/80 border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Your Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">View and update your account information</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-cyan-950/20">
            <TabsTrigger 
              value="account" 
              className={`text-sm ${activeTab === 'account' ? 'bg-cyan-600 text-white' : 'text-muted-foreground'}`}
            >
              Account
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className={`text-sm ${activeTab === 'security' ? 'bg-cyan-600 text-white' : 'text-muted-foreground'}`}
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Username</p>
                    <p className="text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">{user.username}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Credits</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">{formatCredits(user.credits)}</p>
                      <svg className="h-4 w-4 text-cyan-500" viewBox="0 0 24 24" fill="none">
                        <path d="M21 8C21 6.34315 17.866 5 14 5C10.134 5 7 6.34315 7 8M21 8V12C21 13.0195 19.8135 13.9202 18 14.4623C16.8662 14.8012 15.4872 15 14 15C12.5128 15 11.1338 14.8012 10 14.4623C8.18652 13.9202 7 13.0195 7 12V8M21 8C21 9.01946 19.8135 9.92016 18 10.4623C16.8662 10.8012 15.4872 11 14 11C12.5128 11 11.1338 10.8012 10 10.4623C8.18652 9.92016 7 9.01946 7 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                        <path d="M3 12.0001V16.0001C3 17.0196 4.18652 17.9203 6 18.4624C7.13383 18.8013 8.51275 19.0001 10 19.0001C11.4872 19.0001 12.8662 18.8013 14 18.4624C15.8135 17.9203 17 17.0196 17 16.0001V15.0001M3 12.0001C3 10.8034 4.63505 9.7703 7 9.28882M3 12.0001C3 13.0196 4.18652 13.9203 6 14.4624C7.13383 14.8013 8.51275 15.0001 10 15.0001C10.695 15.0001 11.3663 14.9567 12 14.8759" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">{user.email}</p>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Registered</p>
                    <p className="text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                      {formatDate(user.registerdate * 1000)}
                    </p>
                  </div>
                </div>

                <Form {...usernameForm}>
                  <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-3">
                    <FormField
                      control={usernameForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">New Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="text" 
                              placeholder="Enter new username" 
                              className="h-9 text-sm bg-cyan-950/20 border-cyan-500/20 focus:border-cyan-500/40" 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-9 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                      Update Username
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
                <FormField
                  control={passwordForm.control}
                  name="oldpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter current password" 
                          className="h-9 text-sm bg-cyan-950/20 border-cyan-500/20 focus:border-cyan-500/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter new password" 
                          className="h-9 text-sm bg-cyan-950/20 border-cyan-500/20 focus:border-cyan-500/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm new password" 
                          className="h-9 text-sm bg-cyan-950/20 border-cyan-500/20 focus:border-cyan-500/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-9 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  Update Password
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

