"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, MessageCircle, Phone, MapPin, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useChatPinned } from "@/hooks/use-chat-pinned"

interface ContactPageProps {
  /** Closes the modal. */
  onClose: () => void
  /** When true the component renders in dark mode (black background / white text). */
  isDark?: boolean
}

export default function ContactPage({ onClose, isDark = false }: ContactPageProps) {
  const { isChatPinnedLeft, isChatPinnedRight } = useChatPinned()
  /* ───────────────────────── State ───────────────────────── */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  /* ─────────────────────── Handlers ──────────────────────── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate async submission (replace with real API call / server action)
    await new Promise((res) => setTimeout(res, 1200))

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset success state after a short delay
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3500)
  }

  /* ─────────────────────── UI Helpers ────────────────────── */
  const themed = (light: string, dark: string) => (isDark ? dark : light)

  const contactInfo = [
    {
      icon: Mail,
      label: "Email Us",
      value: "hello@arpostudio.com",
      description: "General enquiries",
    },
    {
      icon: MessageCircle,
      label: "Support",
      value: "support@arpostudio.com",
      description: "Technical help",
    },
    {
      icon: Phone,
      label: "Business",
      value: "partnerships@arpostudio.com",
      description: "Partnerships & opportunities",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "San Francisco, CA",
      description: "Remote-first HQ",
    },
  ] as const

  /* ───────────────────────── Render ──────────────────────── */
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 ${
      isChatPinnedLeft ? 'modal-with-chat-left' : isChatPinnedRight ? 'modal-with-chat-right' : ''
    }`}>
      <div
        className={`flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border-2 ${
          isDark ? "border-white bg-black" : "border-black bg-white"
        }`}
      >
        {/* Header */}
        <header
          className={`flex items-center justify-between border-b px-4 sm:px-6 py-4 ${themed("border-black", "border-white")}`}
        >
          <h2 className={`text-lg sm:text-xl font-bold ${themed("text-black", "text-white")}`}>Contact Us</h2>
          <Button 
            aria-label="Close contact modal" 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
            className="p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none text-black dark:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-2">
            {/* ─────────────── Contact Form ─────────────── */}
            <section>
              <h3 className={`mb-2 text-lg font-semibold ${themed("text-black", "text-white")}`}>Send us a message</h3>
              <p className={themed("text-gray-700", "text-gray-300")}>
                Have a question, suggestion, or just want to say hello? We’d love to hear from you.
              </p>

              {submitted ? (
                <Card
                  className={`mt-6 flex flex-col items-center gap-4 border-2 ${
                    isDark ? "border-green-700 bg-green-950" : "border-green-400 bg-green-50"
                  }`}
                >
                  <Send className="h-10 w-10 text-green-600" />
                  <h4 className="text-lg font-medium text-green-700 dark:text-green-300">Message sent!</h4>
                  <p className="text-center text-green-700 dark:text-green-300">
                    Thank you for reaching out. We’ll get back to you within one business day.
                  </p>
                </Card>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <Input
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Textarea
                    name="message"
                    placeholder="Message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Sending…" : "Send message"}
                  </Button>
                </form>
              )}
            </section>

            {/* ─────────────── Contact Details ─────────────── */}
            <aside className="space-y-6">
              {contactInfo.map(({ icon: Icon, label, value, description }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className={`rounded-md p-2 ${isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={`font-medium ${themed("text-black", "text-white")}`}>{label}</p>
                    <p className={themed("text-gray-800", "text-gray-300")}>{value}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
