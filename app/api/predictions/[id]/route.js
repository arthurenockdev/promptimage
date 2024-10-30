import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error(
        'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
      );
    }

    const { prompt, width, height } = await request.json();

    const options = {
      version: "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f",
      input: {
        prompt,
        width,
        height,
      }
    };

    if (WEBHOOK_HOST) {
      options.webhook = `${WEBHOOK_HOST}/api/webhooks`;
      options.webhook_events_filter = ["start", "completed"];
    }

    // Add retry logic for prediction creation
    let prediction;
    let retries = 3;
    
    while (retries > 0) {
      try {
        prediction = await replicate.predictions.create(options);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await delay(1000);
      }
    }

    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Error in prediction:', error);
    return NextResponse.json(
      { detail: error.message },
      { status: 500 }
    );
  }
}