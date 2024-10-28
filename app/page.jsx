'use client'

import React, { useState } from "react"
import { Sparkles, Upload, Wand2, Image as ImageIcon, Clock, DollarSign, Frown, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  const faqItems = [
    {
      id: "faq-1",
      question: "What types of images can your AI generate?",
      answer: "Our AI-platform can generate a wide variety of images based on text prompts, including landscapes, portraits, abstract art, product visualizations, and more. The possibilities are limited only by your imagination and the text descriptions you provide."
    },
    {
      id: "faq-2",
      question: "How does the AI understand my text prompt?",
      answer: "Our AI uses advanced natural language processing to understand the context, style, and key elements of your text input. It then translates these insights into visual elements to create an image that matches your description."
    },
    {
      id: "faq-3",
      question: "Is there a limit to how many images I can generate?",
      answer: "The number of images you can generate depends on your subscription plan. Check our pricing page for more details on image generation limits."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/" aria-label="ImageAI Home">
          <Sparkles className="h-6 w-6 mr-2" />
          <span className="font-bold text-lg">PromptImage</span>
        </Link>
        <nav className="ml-auto" aria-label="Main Navigation">
          <ul className="flex gap-4 sm:gap-6">
            <li>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
                Pricing
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Turn Your Words into Stunning Images
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Describe any image you can imagine, and watch as our AI brings it to life in seconds. From concept art to photorealistic scenes, the possibilities are endless.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/login">Start Generating</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Struggling with Visual Creation?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Clock, title: "Time-Consuming Process", description: "Traditional image creation and editing can take hours, slowing down your creative process." },
                { icon: DollarSign, title: "Expensive Design Tools", description: "Professional design software and stock photo subscriptions can be costly for individuals and small teams." },
                { icon: Frown, title: "Limited by Artistic Skill", description: "Not everyone has the artistic ability to create the images they envision, limiting creative expression." }
              ].map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <Icon className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Upload, title: "1. Enter Your Text", description: "Describe the image you want to create in detail." },
                { icon: Wand2, title: "2. AI Generates Image", description: "Our advanced AI interprets your text and creates a matching image." },
                { icon: ImageIcon, title: "3. Refine & Download", description: "Adjust your prompt if needed, then download your perfect image." }
              ].map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <Icon className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Create Stunning Images in Seconds
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Unleash your creativity with AI-powered image generation. Whether you need concept art, illustrations, or photorealistic scenes, our AI can create it all from your text descriptions.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href="/generate">Start Creating</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Frequently Asked Questions</h2>
            <div className="w-full max-w-3xl mx-auto space-y-4">
              {faqItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
                    aria-expanded={openFaq === item.id}
                    aria-controls={`${item.id}-content`}
                  >
                    <span className="font-medium">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        openFaq === item.id ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === item.id && (
                    <div
                      id={`${item.id}-content`}
                      className="p-4 bg-gray-50"
                      role="region"
                      aria-labelledby={item.id}
                    >
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <span>&copy; {new Date().getFullYear()} PromptImage. All rights reserved.</span>
            <nav aria-label="Footer Navigation">
              <ul className="flex flex-wrap gap-4 mt-4 md:mt-0">
                <li>
                  <Link href="/terms-of-service" className="text-sm hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-notice" className="text-sm hover:underline">
                    Privacy Notice
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="text-sm hover:underline">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="mailto:promptimage@gmail.com" className="text-sm hover:underline">
                    promptimage@gmail.com
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}