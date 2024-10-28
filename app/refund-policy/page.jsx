import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container px-4 py-6 lg:px-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </header>
      <main className="container px-4 py-6 lg:px-6">
        <article className="prose prose-gray dark:prose-invert mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Refund Policy</h1>
          <p className="text-muted-foreground mb-6"><em>Effective Date: October 27, 2024</em></p>
          
          <p>Thank you for choosing PromptImage! We strive to provide a high-quality AI image generation service. Please review our refund policy below.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. General Policy</h2>
          <p>All purchases of paid plans on PromptImage are final. Due to the nature of digital products and services, we do not offer refunds once a purchase is completed.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Exceptions</h2>
          <p>Refunds may be granted only in the following exceptional circumstances:</p>
          <ul>
            <li><strong>Service Malfunction:</strong> If technical issues prevent you from using our service and we are unable to resolve them within a reasonable timeframe, you may be eligible for a refund.</li>
            <li><strong>Billing Errors:</strong> If you were incorrectly charged due to a billing error, please contact us for assistance.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Refund Process</h2>
          <p>To request a refund in the event of an exception, please contact our support team at <a href="mailto:promptimage@gmail.com" className="text-primary hover:underline">promptimage@gmail.com</a> within 7 days of the billing date. Include your account information and a description of the issue. Approved refunds will be processed to the original payment method within 10 business days.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Changes to this Policy</h2>
          <p>We may update this refund policy from time to time. Changes take effect upon posting on our website, and continued use of our service signifies acceptance of the updated policy.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
          <p>For questions regarding our refund policy, please reach out to us at <a href="mailto:promptimage@gmail.com" className="text-primary hover:underline">promptimage@gmail.com</a>.</p>

          <hr className="my-8" />

          <p className="text-xl font-semibold text-center">Thank you for using PromptImage!</p>
        </article>
      </main>
    </div>
  )
}