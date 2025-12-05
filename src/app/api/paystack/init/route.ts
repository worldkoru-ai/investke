export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, amount, reference } = body;
    
    return Response.json({
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email,
      amount,
      reference,
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}