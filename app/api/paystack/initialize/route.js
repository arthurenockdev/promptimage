// app/api/paystack/initialize/route.js
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req) {
  try {
    const { email, amount, plan } = await req.json();

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        plan,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`, // Redirect back to pricing page
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: 'Payment initialization failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}