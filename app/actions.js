'use server';

import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export async function syncPlans() {
  configureLemonSqueezy();

  // Fetch all the variants from the database.
  const productVariants = await db.select().from(plans);

  // Helper function to add a variant to the productVariants array and sync it with the database.
  async function _addVariant(variant) {
    // eslint-disable-next-line no-console -- allow
    console.log(`Syncing variant ${variant.name} with the database...`);

    // Sync the variant with the plan in the database.
    await db
      .insert(plans)
      .values(variant)
      .onConflictDoUpdate({ target: plans.variantId, set: variant });

    /* eslint-disable no-console -- allow */
    console.log(`${variant.name} synced with the database...`);

    productVariants.push(variant);
  }

  // Fetch products from the Lemon Squeezy store.
  const products = await listProducts({
    filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
    include: ['variants'],
  });

  // Loop through all the variants.
  const allVariants = products.data?.included;

  // for...of supports asynchronous operations, unlike forEach.
  if (allVariants) {
    /* eslint-disable no-await-in-loop -- allow */
    for (const v of allVariants) {
      const variant = v.attributes;

      // Skip draft variants or if there's more than one variant, skip the default
      // variant. See https://docs.lemonsqueezy.com/api/variants
      if (
        variant.status === 'draft' ||
        (allVariants.length !== 1 && variant.status === 'pending')
      ) {
        // `return` exits the function entirely, not just the current iteration.
        // so use `continue` instead.
        continue;
      }

      // Fetch the Product name.
      const productName =
        (await getProduct(variant.product_id)).data?.data.attributes.name ?? '';

      // Fetch the Price object.
      const variantPriceObject = await listPrices({
        filter: {
          variantId: v.id,
        },
      });

      const currentPriceObj = variantPriceObject.data?.data.at(0);
      const isUsageBased =
        currentPriceObj?.attributes.usage_aggregation !== null;
      const interval = currentPriceObj?.attributes.renewal_interval_unit;
      const intervalCount =
        currentPriceObj?.attributes.renewal_interval_quantity;
      const trialInterval = currentPriceObj?.attributes.trial_interval_unit;
      const trialIntervalCount =
        currentPriceObj?.attributes.trial_interval_quantity;

      const price = isUsageBased
        ? currentPriceObj?.attributes.unit_price_decimal
        : currentPriceObj.attributes.unit_price;

      const priceString = price !== null ? price?.toString() ?? '' : '';

      const isSubscription =
        currentPriceObj?.attributes.category === 'subscription';

      // If not a subscription, skip it.
      if (!isSubscription) {
        continue;
      }

      await _addVariant({
        name: variant.name,
        description: variant.description,
        price: priceString,
        interval,
        intervalCount,
        isUsageBased,
        productId: variant.product_id,
        productName,
        variantId: parseInt(v.id),
        trialInterval,
        trialIntervalCount,
        sort: variant.sort,
      });
    }
  }

  return productVariants;
}
