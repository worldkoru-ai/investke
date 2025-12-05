
import { NextRequest, NextResponse } from 'next/server';

// Types
interface PaystackWebhookData {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
      phone?: string;
    };
    metadata: {
      order_id: string;
      client_id: string;
    };
  };
}

// Constants
const SUPPORTED_EVENTS = ['charge.success', 'charge.failed'];
const SUCCESS_STATUS = 'success';

// Utility Functions
function isValidEvent(event: string): boolean {
  return SUPPORTED_EVENTS.includes(event);
}

function formatAmount(amount: number): number {
  return amount / 100; // Convert from kobo to base currency
}

async function processWebhookData(data: PaystackWebhookData) {
  // Process the webhook data based on event type
  const { event, data: webhookData } = data;
  
  if (event === 'charge.success') {
    // Handle successful charge
    console.log('Processing successful charge:', webhookData.reference);
  } else if (event === 'charge.failed') {
    // Handle failed charge
    console.log('Processing failed charge:', webhookData.reference);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const signature = req.headers.get('x-paystack-signature');

  try {
    // Validate signature
    if (!signature) {
      console.error('Missing Paystack signature');
      return NextResponse.json(
        { message: 'Missing Paystack signature' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Log incoming webhook data
    console.log('Received webhook:', {
      event: body.event,
      reference: body.data?.reference,
      metadata: body.data?.metadata
    });

    // Validate webhook signature
    if (!validatePaystackWebhook(signature, body)) {
      console.error('Invalid Paystack signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Validate event type
    if (!isValidEvent(body.event)) {
      console.error(`Unsupported event type: ${body.event}`);
      return NextResponse.json(
        { message: 'Unsupported event type' },
        { status: 400 }
      );
    }

    // Validate metadata
    const { order_id, client_id } = body.data.metadata;
    if (!client_id || !order_id) {
      console.error('Missing metadata:', body.data.metadata);
      return NextResponse.json(
        { message: 'Missing client_id or order_id in metadata' },
        { status: 400 }
      );
    }

    // Process webhook data
    await processWebhookData(body);

    const processingTime = Date.now() - startTime;
    console.log(`Webhook processed in ${processingTime}ms`, {
      event: body.event,
      reference: body.data.reference,
      status: body.data.status,
      processingTime
    });

    return NextResponse.json({
      message: 'Webhook processed successfully',
      orderId: order_id,
      status: body.data.status
    });

  } catch (error: unknown) {
    const processingTime = Date.now() - startTime;
    console.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime
    });

    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    }


}
function validatePaystackWebhook(signature: string, body: any): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return false;
    }
    
    const hash = require('crypto')
      .createHmac('sha512', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    
    return hash === signature;
}

