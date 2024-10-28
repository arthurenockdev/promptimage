'use client'
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { CheckIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import db from '../utils/firestore';

export default function PricingPage() {
  const [isPaddleInitialized, setIsPaddleInitialized] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  
  
  const plans = [
    {
      priceId: "pri_01jb3d3fvhk5b43dsxbwbft1nv",
      name: "Pro",
      price: "$20/month",
      description: "",
      features: [
        "Unlimited AI image generator",
        "15 style presets",
        "Advanced editing tools",
        "Priority email support",
        
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

 

  const handlePayment = (priceId) => {
    if (!userEmail) {
      console.error('No user email available');
      // You might want to redirect to login page or show a message
      return;
    }

    if (typeof window !== 'undefined' && window.Paddle && isPaddleInitialized) {
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1
          }
        ],
        customer: {
          email: userEmail
        },
      });
    } else {
      console.error('Paddle is not initialized');
    }
  };

  const savePayment = async (event) => {
    
    //
    try {
      
      // Save to Firestore
      await addDoc(collection(db, "subscriptions"), {
        transactionId: event.data.transaction_id,
        status:event.data.status,
        card_last4:event.data.payment.method_details.card.last4,
        card_type:event.data.payment.method_details.card.type,
        currency_code:event.data.currency_code,
        country_code:event.data.customer.address.country_code,
        user_email:event.data.customer.email,
        startDate: new Date().toISOString(),
        eventName:event.name
      });
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const initializePaddle = () => {
    if (typeof window !== 'undefined' && window.Paddle) {
      Paddle.Environment.set('sandbox')
      window.Paddle.Setup({ 
        token: 'test_6ca47b32335bd216ffdf2d715e8',
        eventCallback: function(event) {
          console.log('Paddle event:', event);
          if (event.name === "checkout.completed") {

            savePayment(event);
          }
        }
      });
      setIsPaddleInitialized(true);
    }
  };

  const handlePaddleLoad = () => {
    initializePaddle();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Script 
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={handlePaddleLoad}
        strategy="lazyOnload"
      />
      
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
                <div key={plan.priceId} className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
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
                    onClick={() => handlePayment(plan.priceId)}
                    className="mt-6"
                    disabled={!isPaddleInitialized || !userEmail}
                  >
                    {!userEmail 
                      ? 'Please Log In to Subscribe' 
                      : isPaddleInitialized 
                        ? 'Choose Plan' 
                        : 'Loading...'}
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