"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/providers/auth-provider"
import { authApi } from "@/lib/api"
import { HCaptchaWrapper } from "@/components/auth/hcaptcha-wrapper"

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("id")
  const [captchaToken, setCaptchaToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!captchaToken) {
      toast.error("Please complete the captcha verification")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.login({
        username: values.username,
        password: values.password,
        hcaptcha: captchaToken,
      })

      if (response.success && response.token) {
        login(response.token)
        if (chatId) {
          router.replace(`/chat?id=${chatId}`)
        } else {
          router.replace("/chat")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center w-full bg-[#0a1929]">
      <Card className="w-full max-w-md z-20 bg-black/40 backdrop-blur-md border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-600">Login to Walkie AI</CardTitle>
          <CardDescription className="text-center text-cyan-400">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username or email" className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <HCaptchaWrapper onVerify={setCaptchaToken} />

              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-cyan-400">
            <Link href="/reset-password" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-center text-cyan-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

