import { getStripeSync } from './stripeClient';
import { storage } from './storage';
import { executeDepositPipeline } from './blockchain/pipeline';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    try {
      const event = JSON.parse(payload.toString());
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.type === 'pix_deposit') {
          console.log(`[webhook] PIX payment succeeded: ${paymentIntent.id}`);
          const tx = await storage.getTransactionByStripePaymentIntentId(paymentIntent.id);
          if (tx && tx.status === 'awaiting_payment') {
            await storage.updateTransactionStatus(tx.id, 'processing', 0);
            executeDepositPipeline(tx.id, tx.amountUsd!, tx.userId).catch((err) => {
              console.error(`[webhook] Pipeline failed for tx ${tx.id}:`, err);
            });
          }
        }
      }
    } catch (err) {
      console.error('[webhook] Error processing PIX event:', err);
    }
  }
}
