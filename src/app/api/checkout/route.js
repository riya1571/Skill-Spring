import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { applicationId, taskTitle, price } = await req.json();

    // স্ট্রাইপ চেকআউট সেশন তৈরি
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: taskTitle,
              description: `Payment for Application ID: ${applicationId}`,
            },
            unit_amount: price * 100, // স্ট্রাইপ সেন্ট (cents) হিসেবে হিসাব করে, তাই ১০০ দিয়ে গুণ
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/admin?success=true&appId=${applicationId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/admin`,
      metadata: {
        applicationId: applicationId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE_ERROR:", error);
    return NextResponse.json({ message: "Payment failed", error: error.message }, { status: 500 });
  }
}