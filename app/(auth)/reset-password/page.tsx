"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { authApi } from "@/lib/api"
import { CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { HCaptchaWrapper } from "@/components/auth/hcaptcha-wrapper"

const formSchema = z.object({
  email: z.string().email("Invalid email format"),
})

interface ResetPasswordResponse {
  success: boolean
  message?: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [captchaToken, setCaptchaToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResponse, setApiResponse] = useState<{ success: boolean; message: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!captchaToken) {
      toast.error("Please complete the captcha verification")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.resetPassword({
        email: values.email,
        hcaptcha: captchaToken,
      }) as ResetPasswordResponse

      if (response.success) {
        toast.success("Password reset instructions have been sent to your email")
        form.reset()
      } else {
        toast.error("Failed to send reset instructions")
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to send reset instructions"
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
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-600">Reset Password</CardTitle>
          <CardDescription className="text-center text-cyan-400">Enter your email to receive password reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="bg-neutral-900/50 border-cyan-500/20 text-white focus:border-cyan-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <HCaptchaWrapper onVerify={setCaptchaToken} />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Instructions..." : "Send Reset Instructions"}
              </Button>

              {apiResponse && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  {apiResponse.success ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-500" />
                  )}
                  <p className={apiResponse.success ? "text-green-500" : "text-red-500"}>
                    {apiResponse.message}
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-cyan-400">
            Remember your password?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

