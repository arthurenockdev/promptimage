
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firestore';


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Verify Paystack webhook signature
function verifySignature(request_body, paystack_signature) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(request_body))
    .digest('hex');
  
  return hash === paystack_signature;
}

// Handle subscription events
async function handleSubscriptionEvent(event, data) {
  const subscriptionsRef = collection(db, 'subscriptions');

  switch (event) {
    case 'subscription.create':
      await addDoc(subscriptionsRef, {
        subscriptionCode: data.subscription_code,
        customerEmail: data.customer.email,
        customerCode: data.customer.customer_code,
        planCode: data.plan.plan_code,
        status: data.status,
        amount: data.amount,
        nextPaymentDate: data.next_payment_date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      break;

    case 'subscription.disable':
      const q = query(subscriptionsRef, 
        where('subscriptionCode', '==', data.subscription_code)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        });
      });
      break;

    case 'subscription.not_renew':
      const notRenewQuery = query(subscriptionsRef, 
        where('subscriptionCode', '==', data.subscription_code)
      );
      
      const notRenewSnapshot = await getDocs(notRenewQuery);
      notRenewSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          status: 'non_renewing',
          updatedAt: new Date().toISOString()
        });
      });
      break;
  }
}

// Handle charge/payment events
async function handleChargeEvent(event, data) {
  const paymentsRef = collection(db, 'payments');

  switch (event) {
    case 'charge.success':
      await addDoc(paymentsRef, {
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customer.email,
        customerCode: data.customer.customer_code,
        paymentChannel: data.channel,
        status: data.status,
        transactionDate: data.paid_at,
        createdAt: new Date().toISOString()
      });
      break;

    case 'invoice.payment_failed':
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(subscriptionsRef, 
        where('subscriptionCode', '==', data.subscription.subscription_code)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          status: 'attention',
          lastFailedPayment: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      break;
  }
}

export async function POST(req) {
  try {
    const headersList = headers();
    const signature = headersList.get('x-paystack-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const { event, data } = body;

    // Handle different event types
    if (event.startsWith('subscription.')) {
      await handleSubscriptionEvent(event, data);
    } else if (event.startsWith('charge.') || event.startsWith('invoice.')) {
      await handleChargeEvent(event, data);
    }

    return NextResponse.json({ status: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}