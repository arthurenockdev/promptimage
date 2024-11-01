// File: src/app/api/paystack/webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { headers } from 'next/headers';
import db from '../../../utils/firestore';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';

// Configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const WEBHOOK_IP_WHITELIST = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220'
];

// Constants
const SubscriptionStatus = {
  ACTIVE: 'active',
  NON_RENEWING: 'non-renewing',
  ATTENTION: 'attention',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const PaymentEvents = {
  CHARGE_SUCCESS: 'charge.success',
  SUBSCRIPTION_CREATE: 'subscription.create',
  SUBSCRIPTION_DISABLE: 'subscription.disable',
  SUBSCRIPTION_NOT_RENEW: 'subscription.not_renew',
  INVOICE_CREATE: 'invoice.create',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  SUBSCRIPTION_EXPIRING_CARDS: 'subscription.expiring_cards'
};

// Security Helper Functions
function verifySignature(request_body, paystack_signature) {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(request_body))
      .digest('hex');
    
    return hash === paystack_signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

function isValidIP(clientIP) {
  if (!clientIP) return false;
  const ip = clientIP.split(',')[0].trim();
  return WEBHOOK_IP_WHITELIST.includes(ip);
}

// Data Extraction Helper Functions
function extractCustomerData(customer) {
  return {
    email: customer?.email || null,
    customerCode: customer?.customer_code || null,
    firstName: customer?.first_name || null,
    lastName: customer?.last_name || null,
    phone: customer?.phone || null
  };
}

function extractPlanData(plan) {
  return {
    name: plan?.name || null,
    planCode: plan?.plan_code || null,
    amount: plan?.amount || 0,
    interval: plan?.interval || null,
    currency: plan?.currency || null
  };
}

// Logging Helper Functions
function logError(context, error, additionalData = {}) {
  console.error({
    timestamp: new Date().toISOString(),
    context,
    error: error.message,
    stack: error.stack,
    ...additionalData
  });
}

function logEvent(eventType, data) {
  console.log({
    timestamp: new Date().toISOString(),
    eventType,
    data
  });
}

// Event Handlers
async function handleSubscriptionEvent(event, data) {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    
    const baseSubscriptionData = {
      subscriptionCode: data.subscription_code,
      status: data.status,
      amount: data.amount,
      customer: extractCustomerData(data.customer),
      plan: extractPlanData(data.plan),
      createdAt: data.created_at,
      nextPaymentDate: data.next_payment_date,
      lastUpdated: serverTimestamp(),
      eventType: event
    };

    switch (event) {
      case PaymentEvents.SUBSCRIPTION_CREATE:
        const newSubscription = {
          ...baseSubscriptionData,
          authorization: data.authorization ? {
            authorizationCode: data.authorization.authorization_code,
            cardType: data.authorization.card_type,
            last4: data.authorization.last4,
            expMonth: data.authorization.exp_month,
            expYear: data.authorization.exp_year,
            bank: data.authorization.bank
          } : null
        };
        
        logEvent(PaymentEvents.SUBSCRIPTION_CREATE, newSubscription);
        
        try {
          const docRef = await addDoc(subscriptionsRef, newSubscription);
          console.log('New subscription saved with ID:', docRef.id);
        } catch (error) {
          logError('saveNewSubscription', error, newSubscription);
          throw error;
        }
        break;

      case PaymentEvents.SUBSCRIPTION_DISABLE:
        const disabledSubscription = {
          ...baseSubscriptionData,
          disabledAt: serverTimestamp(),
          reason: data.status === SubscriptionStatus.COMPLETED ? 'completed' : 'cancelled'
        };
        
        logEvent(PaymentEvents.SUBSCRIPTION_DISABLE, disabledSubscription);
        
        try {
          const docRef = await addDoc(subscriptionsRef, disabledSubscription);
          console.log('Disabled subscription saved with ID:', docRef.id);
        } catch (error) {
          logError('saveDisabledSubscription', error, disabledSubscription);
          throw error;
        }
        break;

      case PaymentEvents.SUBSCRIPTION_NOT_RENEW:
        const nonRenewingSubscription = {
          ...baseSubscriptionData,
          cancelledAt: serverTimestamp()
        };
        
        logEvent(PaymentEvents.SUBSCRIPTION_NOT_RENEW, nonRenewingSubscription);
        
        try {
          const docRef = await addDoc(subscriptionsRef, nonRenewingSubscription);
          console.log('Non-renewing subscription saved with ID:', docRef.id);
        } catch (error) {
          logError('saveNonRenewingSubscription', error, nonRenewingSubscription);
          throw error;
        }
        break;

      case PaymentEvents.INVOICE_CREATE:
        const newInvoice = {
          ...baseSubscriptionData,
          dueDate: data.due_date,
          invoiceStatus: data.status
        };
        
        logEvent(PaymentEvents.INVOICE_CREATE, newInvoice);
        
        try {
          const invoicesRef = collection(db, 'invoices');
          const docRef = await addDoc(invoicesRef, newInvoice);
          console.log('New invoice saved with ID:', docRef.id);
        } catch (error) {
          logError('saveNewInvoice', error, newInvoice);
          throw error;
        }
        break;

      case PaymentEvents.INVOICE_PAYMENT_FAILED:
        const failedPayment = {
          ...baseSubscriptionData,
          failedAt: serverTimestamp(),
          nextRetry: data.next_retry_date,
          description: data.description
        };
        
        logEvent(PaymentEvents.INVOICE_PAYMENT_FAILED, failedPayment);
        
        try {
          const failedPaymentsRef = collection(db, 'failed_payments');
          const docRef = await addDoc(failedPaymentsRef, failedPayment);
          console.log('Failed payment saved with ID:', docRef.id);
        } catch (error) {
          logError('saveFailedPayment', error, failedPayment);
          throw error;
        }
        break;

      case PaymentEvents.SUBSCRIPTION_EXPIRING_CARDS:
        if (Array.isArray(data)) {
          const expiringCardsRef = collection(db, 'expiring_cards');
          
          for (const item of data) {
            const expiringCard = {
              subscriptionCode: item.subscription?.subscription_code,
              customer: extractCustomerData(item.customer),
              expiryDate: item.expiry_date,
              cardBrand: item.brand,
              description: item.description,
              lastUpdated: serverTimestamp(),
              eventType: event
            };
            
            try {
              const docRef = await addDoc(expiringCardsRef, expiringCard);
              console.log('Expiring card saved with ID:', docRef.id);
            } catch (error) {
              logError('saveExpiringCard', error, expiringCard);
              // Continue processing other cards even if one fails
            }
          }
        }
        break;

      default:
        console.warn(`Unhandled subscription event: ${event}`);
    }
  } catch (error) {
    logError('handleSubscriptionEvent', error, { event, data });
    throw error;
  }
}

async function handleChargeEvent(event, data) {
  try {
    if (event === PaymentEvents.CHARGE_SUCCESS) {
      const paymentData = {
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        customer: extractCustomerData(data.customer),
        paymentChannel: data.channel,
        status: data.status,
        paidAt: data.paid_at,
        metadata: data.metadata || {},
        lastUpdated: serverTimestamp(),
        eventType: event
      };
      
      logEvent(PaymentEvents.CHARGE_SUCCESS, paymentData);
      
      try {
        const paymentsRef = collection(db, 'payments');
        const docRef = await addDoc(paymentsRef, paymentData);
        console.log('Payment saved with ID:', docRef.id);
      } catch (error) {
        logError('savePayment', error, paymentData);
        throw error;
      }
    }
  } catch (error) {
    logError('handleChargeEvent', error, { event, data });
    throw error;
  }
}

// Main Webhook Handler
export async function POST(request) {
  try {
    // Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Get headers safely
    const headersList = headers();
    
    // Extract required headers
    const signature = headersList.get('x-paystack-signature');
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwardedFor || realIP;

    // Log incoming request
    logEvent('webhook.received', { 
      clientIP,
      method: request.method,
      headers: {
        signature: !!signature,
        hasIP: !!clientIP
      }
    });

    // Validate signature
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Validate IP
    if (!isValidIP(clientIP)) {
      logError('webhookHandler', new Error('Invalid IP'), { clientIP });
      return NextResponse.json(
        { error: 'Invalid source IP address' },
        { status: 403 }
      );
    }

    // Clone the request and get body
    const body = await request.json();

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      logError('webhookHandler', new Error('Invalid signature'), { signature });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const { event, data } = body;

    // Process the webhook event
    if (!event || !data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Return immediate success response
    const response = NextResponse.json({ 
      status: true,
      message: 'Webhook received successfully',
      event: event
    });

    // Process events asynchronously
    if (event.startsWith('subscription.') || event.startsWith('invoice.')) {
      handleSubscriptionEvent(event, data).catch(error => {
        logError('asyncSubscriptionProcessing', error, { event, data });
      });
    } else if (event.startsWith('charge.')) {
      handleChargeEvent(event, data).catch(error => {
        logError('asyncChargeProcessing', error, { event, data });
      });
    } else {
      console.warn(`Unhandled webhook event type: ${event}`);
    }

    return response;

  } catch (error) {
    logError('POST_webhook', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}