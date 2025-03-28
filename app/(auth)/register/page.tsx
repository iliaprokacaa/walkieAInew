"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { authApi } from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import { HCaptchaWrapper } from "@/components/auth/hcaptcha-wrapper"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be 20 characters or less")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => !val.includes(" "), "Password cannot contain spaces"),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

interface RegisterResponse {
  success: boolean
  message?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [captchaToken, setCaptchaToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!captchaToken) {
      toast.error("Please complete the captcha verification")
      return
    }

    if (!values.termsAccepted) {
      toast.error("Please accept the Terms of Service and Privacy Policy")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        hcaptcha: captchaToken,
      }) as RegisterResponse

      if (response.success) {
        toast.success("Account created successfully")
        router.push("/login")
      } else {
        const errorMessage = response.message || "Failed to create account"
        toast.error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create account"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      if (typeof window !== 'undefined' && (window as any).hcaptcha) {
        (window as any).hcaptcha.reset()
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center w-full bg-[#0a1929]">
      <Card className="w-full max-w-md z-20 bg-black/40 backdrop-blur-md border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-600">Create an Account</CardTitle>
          <CardDescription className="text-center text-cyan-400">Sign up for Walkie AI to get started</CardDescription>
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
                      <Input placeholder="Choose a username" className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500" {...field} />
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
                      <Input 
                        type="password" 
                        placeholder="Create a password" 
                        className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-cyan-400">
                        I agree to the{" "}
                        <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 hover:underline" target="_blank">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 hover:underline" target="_blank">
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <HCaptchaWrapper onVerify={setCaptchaToken} />

              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-cyan-400">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

