import { NextResponse } from "next/server";

type InitBody = {
  email: string;
  amount: number | string; // amount in Naira
  callback_url?: string;
  userId: string;
  planId: string;         // REQUIRED for wallet top-up
  metadata?: Record<string, unknown>;
  reference?: string;
};

const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";
const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;

function makeReference() {
  return `ref_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}



export async function POST(req: Request) {
  if (!PAYSTACK_KEY) {
    return NextResponse.json(
      { error: "Missing PAYSTACK_SECRET_KEY in environment" },
      { status: 500 }
    );
  }

  let body: InitBody;
  try {
    body = (await req.json()) as InitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, amount, callback_url, userId,planId, metadata, reference } = body;

  if (!email || !amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json(
      { error: "Invalid payload. 'email' and positive 'amount' are required." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "'userId' is required for wallet top-up." },
      { status: 400 }
    );
  }



  // Paystack expects amount in kobo (NGN). Convert Naira to kobo.
  const amountKobo = Math.round(Number(amount) * 100);
  const txReference = reference ?? makeReference();


  const payload = {
  email,
  amount: amountKobo,
  callback_url,
  reference: txReference,
  metadata: {
    ...(metadata || {}),
    userId,
    planId,
    type: "investment",
  },

  // ✅ Move subaccounts OUTSIDE metadata
  subaccounts: [
    {
      subaccount: process.env.SUBACCOUNT_1, // must be your Subaccount Code e.g. "ACCT_12345"
      share: 80, // subaccount gets 80%
    },
  ],
};


  try {
    const res = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Paystack initialization failed", details: data },
        { status: res.status || 502 }
      );
    }

    // Initialization successful, return Paystack response to frontend
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Unable to reach Paystack", details: (err as Error).message },
      { status: 502 }
    );
  }
}
