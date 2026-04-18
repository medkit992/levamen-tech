import Stripe from "https://esm.sh/stripe@18.4.0?target=denonext";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

type CatalogSpec = {
  code: string;
  lookupKey: string;
  name: string;
  description: string;
  unitAmount: number;
  recurring?: Stripe.PriceCreateParams.Recurring;
};

export function createStripeClient(appName: string) {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(stripeSecretKey, {
    appInfo: {
      name: appName,
      version: "1.0.0",
    },
  });
}

function normalizeMoney(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function recurringMatches(
  current: Stripe.Price.Recurring | null,
  expected: Stripe.PriceCreateParams.Recurring | undefined
) {
  if (!current && !expected) return true;
  if (!current || !expected) return false;

  return (
    current.interval === expected.interval &&
    (current.interval_count ?? 1) === (expected.interval_count ?? 1)
  );
}

async function findProductByCode(stripe: Stripe, code: string, name: string) {
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    const match =
      page.data.find((product) => product.metadata?.catalog_code === code) ||
      page.data.find((product) => product.name.trim().toLowerCase() === name.trim().toLowerCase()) ||
      null;

    if (match) {
      return match;
    }

    if (!page.has_more || page.data.length === 0) {
      return null;
    }

    startingAfter = page.data[page.data.length - 1]?.id;
  }
}

async function ensureCatalogProduct(stripe: Stripe, spec: CatalogSpec) {
  const existing = await findProductByCode(stripe, spec.code, spec.name);
  if (existing) {
    return existing;
  }

  return stripe.products.create({
    name: spec.name,
    description: spec.description,
    metadata: {
      catalog_code: spec.code,
      managed_by: "levamen-tech",
    },
  });
}

export async function ensureCatalogPrice(stripe: Stripe, spec: CatalogSpec) {
  const product = await ensureCatalogProduct(stripe, spec);
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  const existing =
    prices.data.find((price) => price.lookup_key === spec.lookupKey) ||
    prices.data.find(
      (price) =>
        price.unit_amount === spec.unitAmount &&
        recurringMatches(price.recurring, spec.recurring)
    );

  if (existing) {
    return existing;
  }

  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: spec.unitAmount,
    recurring: spec.recurring,
    lookup_key: spec.lookupKey,
    metadata: {
      catalog_code: spec.code,
      managed_by: "levamen-tech",
    },
  });
}

function buildCatalogSpecsFromSnapshot(snapshot: Record<string, unknown>) {
  const specs: CatalogSpec[] = [];

  const plan = asRecord(snapshot.plan);
  if (plan) {
    const planName = String(plan.name || "Website").trim();
    const planKey = slugify(String(plan.key || planName || "plan"));
    const planSetupAmount = normalizeMoney(plan.setupPrice);
    const planMonthlyAmount = normalizeMoney(plan.monthlyPrice);

    if (planSetupAmount > 0) {
      specs.push({
        code: `${planKey}-setup`,
        lookupKey: `${planKey}-setup`,
        name: `${planName} Website Setup`,
        description: `One-time setup and launch work for the ${planName} package.`,
        unitAmount: planSetupAmount,
      });
    }

    if (planMonthlyAmount > 0) {
      specs.push({
        code: `${planKey}-maintenance-monthly`,
        lookupKey: `${planKey}-maintenance-monthly`,
        name: `${planName} Website Maintenance`,
        description: `Monthly maintenance and hosting for the ${planName} package.`,
        unitAmount: planMonthlyAmount,
        recurring: {
          interval: "month",
        },
      });
    }
  }

  const addons = Array.isArray(snapshot.addons) ? snapshot.addons : [];
  for (const rawAddon of addons) {
    const addon = asRecord(rawAddon);
    if (!addon) continue;

    const addonName = String(addon.name || "Add-on").trim();
    const addonCode = slugify(String(addon.key || addonName || "addon"));
    const addonType = String(addon.type || "one-time");
    const addonAmount = normalizeMoney(addon.price);

    if (addonAmount <= 0) continue;

    specs.push({
      code:
        addonType === "monthly" ? `${addonCode}-monthly` : `${addonCode}-setup`,
      lookupKey:
        addonType === "monthly" ? `${addonCode}-monthly` : `${addonCode}-setup`,
      name: addonName,
      description:
        typeof addon.description === "string" && addon.description.trim()
          ? addon.description.trim()
          : `Levamen Tech add-on: ${addonName}.`,
      unitAmount: addonAmount,
      recurring:
        addonType === "monthly"
          ? {
              interval: "month",
            }
          : undefined,
    });
  }

  const domain = asRecord(snapshot.domain);
  if (domain) {
    const domainSetupAmount = normalizeMoney(domain.oneTimeFee);
    const domainPrivacyAmount = normalizeMoney(domain.monthlyFee);

    if (domainSetupAmount > 0) {
      specs.push({
        code: "domain-registration",
        lookupKey: "domain-registration",
        name: "Domain Registration",
        description: "One-time domain registration and setup.",
        unitAmount: domainSetupAmount,
      });
    }

    if (domainPrivacyAmount > 0) {
      specs.push({
        code: "domain-privacy-monthly",
        lookupKey: "domain-privacy-monthly",
        name: "Domain Privacy",
        description: "Monthly domain privacy protection.",
        unitAmount: domainPrivacyAmount,
        recurring: {
          interval: "month",
        },
      });
    }
  }

  return specs;
}

function buildFallbackCatalogSpecs(inquiry: Record<string, unknown>) {
  const planName = String(inquiry.plan_name || "Website").trim();
  const planKey = slugify(planName || "website");
  const setupTotal = normalizeMoney(
    Number(inquiry.plan_setup_price || 0) +
      Number(inquiry.addon_one_time_total || 0) +
      Number(inquiry.domain_one_time_fee || 0)
  );
  const monthlyTotal = normalizeMoney(
    Number(inquiry.plan_monthly_price || 0) +
      Number(inquiry.addon_monthly_total || 0) +
      Number(inquiry.domain_privacy_monthly_fee || 0)
  );

  const specs: CatalogSpec[] = [];

  if (setupTotal > 0) {
    specs.push({
      code: `${planKey}-custom-setup`,
      lookupKey: `${planKey}-custom-setup`,
      name: `${planName} Website Setup`,
      description: "One-time website setup for a reviewed Levamen Tech inquiry.",
      unitAmount: setupTotal,
    });
  }

  if (monthlyTotal > 0) {
    specs.push({
      code: `${planKey}-custom-maintenance-monthly`,
      lookupKey: `${planKey}-custom-maintenance-monthly`,
      name: `${planName} Website Maintenance`,
      description:
        "Monthly website maintenance for a reviewed Levamen Tech inquiry.",
      unitAmount: monthlyTotal,
      recurring: {
        interval: "month",
      },
    });
  }

  return specs;
}

export function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export async function ensureCustomerForInquiry(
  stripe: Stripe,
  inquiry: Record<string, unknown>
) {
  const inquiryId = String(inquiry.id || "");
  const email = String(inquiry.email || "").trim();
  const fullName = String(inquiry.full_name || "Client").trim();
  const businessName = String(inquiry.business_name || "").trim();

  if (email) {
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 10,
    });

    const existing =
      existingCustomers.data.find(
        (customer) =>
          customer.metadata?.inquiry_id === inquiryId ||
          (businessName &&
            customer.metadata?.business_name?.trim().toLowerCase() ===
              businessName.toLowerCase())
      ) || existingCustomers.data[0];

    if (existing) {
      await stripe.customers.update(existing.id, {
        name: fullName,
        email,
        metadata: {
          ...existing.metadata,
          inquiry_id: inquiryId,
          business_name: businessName,
        },
      });

      return existing.id;
    }
  }

  const customer = await stripe.customers.create({
    email,
    name: fullName,
    metadata: {
      inquiry_id: inquiryId,
      business_name: businessName,
    },
  });

  return customer.id;
}

export async function buildCheckoutLineItems(
  stripe: Stripe,
  inquiry: Record<string, unknown>
) {
  const snapshot = asRecord(inquiry.inquiry_snapshot);
  const specs =
    snapshot != null
      ? buildCatalogSpecsFromSnapshot(snapshot)
      : buildFallbackCatalogSpecs(inquiry);

  if (specs.length === 0) {
    throw new Error("Inquiry does not contain any billable amount.");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let hasRecurring = false;

  for (const spec of specs) {
    const price = await ensureCatalogPrice(stripe, spec);
    if (spec.recurring) {
      hasRecurring = true;
    }

    lineItems.push({
      price: price.id,
      quantity: 1,
    });
  }

  return {
    lineItems,
    hasRecurring,
    itemNames: specs.map((spec) => spec.name),
  };
}
