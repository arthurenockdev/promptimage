'use client'
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import db from '../utils/firestore';

export default function PricingPage() {
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const plans = [
    {
      planCode: "PLN_pkg2sxau15o8zqe",
      name: "Pro",
      price: "$20/month",
      amount: 900000, // Amount in kobo (₦9,000)
      description: "",
      features: [
        "Unlimited AI image generations",
        "Access to all features",
        "Priority email support",
        "Early access to new features"
      ],
    }
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const initializePayment = async (plan) => {
    if (!userEmail) {
      console.error('No user email available');
      return;
    }

    setIsLoading(true);
    try {
      // Initialize transaction
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          amount: plan.amount,
          plan: plan.planCode,
        }),
      });

      const data = await response.json();
      
      if (data.status) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorization_url;
      } else {
        console.error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscription = async (reference) => {
    try {
      // Verify payment on the backend
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.status) {
        // Save subscription to Firestore
        await addDoc(collection(db, "subscriptions"), {
          reference: data.data.reference,
          status: data.data.status,
          plan: data.data.plan,
          customer_email: data.data.customer.email,
          amount: data.data.amount,
          subscription_code: data.data.subscription_code,
          startDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Handle Paystack callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      
      if (reference) {
        saveSubscription(reference);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">PromptImage</span>
        </Link>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  All Access Plan
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Generate stunning visuals with our AI-powered platform.
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              {plans.map((plan) => (
                <div key={plan.planCode} className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 text-4xl font-bold">{plan.price}</div>
                  <p className="mt-2 text-muted-foreground">{plan.description}</p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => initializePayment(plan)}
                    className="mt-6"
                    disabled={!userEmail || isLoading}
                  >
                    {!userEmail 
                      ? 'Please Log In to Subscribe' 
                      : isLoading 
                        ? 'Processing...' 
                        : 'Subscribe Now'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 VisualAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}