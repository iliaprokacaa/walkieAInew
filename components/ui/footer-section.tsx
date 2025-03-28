"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"
import Link from "next/link"

export function Footerdemo() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="text-white">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600">
                Walkie AI
              </h2>
            </div>

            <p className="mt-4 max-w-xs text-gray-300">
              Your AI companion for seamless conversations and enhanced productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
            <div>
              <p className="font-medium text-cyan-400">About us</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-300 transition hover:text-cyan-400">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 transition hover:text-cyan-400">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-cyan-400">Support</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <a href="mailto:support@walkie-ai.com" className="text-gray-300 transition hover:text-cyan-400">
                    support@walkie-ai.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Walkie AI. All rights reserved.</p>
      </div>
    </footer>
  )
} 