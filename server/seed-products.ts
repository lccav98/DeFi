import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  const existing = await stripe.products.search({ query: "name:'DeFi Direct Platform Fee'" });
  if (existing.data.length > 0) {
    console.log('Products already exist, skipping...');
    console.log('Product:', existing.data[0].id);
    const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
    prices.data.forEach(p => console.log(`Price: ${p.id} - ${p.unit_amount} ${p.currency}`));
    return;
  }

  const product = await stripe.products.create({
    name: 'DeFi Direct Platform Fee',
    description: 'Platform service fee for automated PIX-to-DeFi deposits. 1.5% charged per deposit.',
    metadata: {
      type: 'platform_fee',
      feePercent: '1.5',
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 100,
    currency: 'usd',
    metadata: {
      type: 'variable_fee',
    },
  });

  console.log('Created product:', product.id);
  console.log('Created price:', price.id);
  console.log('Done! Platform fee product is ready.');
}

createProducts().catch(console.error);
