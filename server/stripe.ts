// ─────────────────────────────────────────────────────────────
// Stripe — abonnementen (vervangt Mollie stapsgewijs).
//
// Flow: registreren → plankeuze (basic €12,95 / pro €24) → Stripe
// Checkout (mode: subscription) → webhook zet het plan actief en rondt
// de onboarding af. Sleutels en prijs-ID's komen UITSLUITEND uit env:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   STRIPE_PRICE_BASIS (€12,95/mnd), STRIPE_PRICE_PRO (€24/mnd)
//
// Deze module is additief: zolang de env-sleutels ontbreken is Stripe
// simpelweg "niet geconfigureerd" en verandert er niets aan de site.
// ─────────────────────────────────────────────────────────────
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "db";
import { subscriptions } from "@shared/schema";
import { storage } from "./storage";

export type PaidPlan = "basic" | "pro";

const SECRET = process.env.STRIPE_SECRET_KEY;
export const stripe: Stripe | null = SECRET ? new Stripe(SECRET) : null;

/** Is Stripe volledig geconfigureerd (sleutel + webhook-secret + beide prijzen)? */
export function stripeConfigured(): boolean {
  return !!(
    stripe &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PRICE_BASIS &&
    process.env.STRIPE_PRICE_PRO
  );
}

/** Prijs-ID (env) voor een plan. */
export function priceForPlan(plan: PaidPlan): string | undefined {
  if (plan === "basic") return process.env.STRIPE_PRICE_BASIS;
  if (plan === "pro") return process.env.STRIPE_PRICE_PRO;
  return undefined;
}

/** Plan afleiden uit een Stripe-prijs-ID (voor de webhook). */
export function planForPrice(priceId?: string | null): PaidPlan | undefined {
  if (!priceId) return undefined;
  if (priceId === process.env.STRIPE_PRICE_BASIS) return "basic";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return undefined;
}

/**
 * Maak een Stripe Checkout-sessie (abonnement) en geef de betaal-URL terug.
 * Hergebruikt een bestaande Stripe-klant als die er al is.
 */
export async function createStripeCheckout(opts: {
  userId: string;
  email: string;
  plan: PaidPlan;
  baseUrl: string;
}): Promise<string> {
  if (!stripe) throw new Error("Stripe is niet geconfigureerd");
  const price = priceForPlan(opts.plan);
  if (!price) throw new Error(`Geen Stripe-prijs geconfigureerd voor plan '${opts.plan}'`);

  const existing = await storage.getSubscription(opts.userId);

  // BTW: als STRIPE_TAX_RATE (een 21%-tarief) is gezet, komt de BTW bovenop de
  // prijs en verschijnt 'ie apart op de factuur. Prijzen zijn excl. btw.
  const taxRate = process.env.STRIPE_TAX_RATE;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1, ...(taxRate ? { tax_rates: [taxRate] } : {}) }],
    ...(existing?.stripeCustomerId
      ? { customer: existing.stripeCustomerId }
      : { customer_email: opts.email }),
    client_reference_id: opts.userId,
    metadata: { userId: opts.userId, plan: opts.plan },
    subscription_data: { metadata: { userId: opts.userId, plan: opts.plan } },
    allow_promotion_codes: true,
    success_url: `${opts.baseUrl}/betaling-geslaagd?plan=${opts.plan}`,
    cancel_url: `${opts.baseUrl}/lidmaatschap?geannuleerd=1`,
  });

  if (!session.url) throw new Error("Stripe gaf geen checkout-URL terug");
  return session.url;
}

/** Zet het plan actief na een geslaagde betaling en rondt de onboarding af. */
async function activatePlan(
  userId: string,
  plan: PaidPlan,
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null,
): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user) {
    console.warn(`[Stripe] activatePlan: gebruiker ${userId} niet gevonden`);
    return;
  }

  await storage.upsertUser({
    id: user.id,
    email: user.email,
    plan,
    role: user.role as "member" | "master" | "admin",
    mustCompleteOnboarding: false,
  });

  const existing = await storage.getSubscription(userId);
  const fields: any = {
    plan,
    status: "active",
    stripeCustomerId: stripeCustomerId ?? existing?.stripeCustomerId ?? null,
    stripeSubscriptionId: stripeSubscriptionId ?? existing?.stripeSubscriptionId ?? null,
    canceledAt: null,
  };
  if (existing) {
    await storage.updateSubscription(existing.id, fields);
  } else {
    await storage.createSubscription({ userId, ...fields });
  }
  console.log(`[Stripe] Plan '${plan}' geactiveerd voor ${user.email}`);
}

/** Zet een gebruiker terug op 'pending' als het abonnement stopt. */
async function deactivateBySubscriptionId(stripeSubscriptionId: string): Promise<void> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  if (!row) {
    console.warn(`[Stripe] deactivate: geen abonnement voor ${stripeSubscriptionId}`);
    return;
  }
  await storage.updateSubscription(row.id, { status: "canceled", canceledAt: new Date() } as any);
  const user = await storage.getUserById(row.userId);
  if (user) {
    await storage.upsertUser({
      id: user.id,
      email: user.email,
      plan: "pending",
      role: user.role as "member" | "master" | "admin",
    });
    console.log(`[Stripe] Abonnement gestopt voor ${user.email} → plan 'pending'`);
  }
}

/**
 * Verwerkt Stripe-webhooks. Verifieert de handtekening met de ruwe body
 * (req.rawBody, gezet door de express.json verify-callback).
 */
export async function handleStripeWebhook(req: any, res: any): Promise<void> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: "Stripe niet geconfigureerd" });
    return;
  }

  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.error("[Stripe] Ongeldige webhook-handtekening:", err?.message);
    res.status(400).send(`Webhook Error: ${err?.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || (session.metadata?.userId ?? "");
        const plan = (session.metadata?.plan as PaidPlan) || undefined;
        if (userId && plan) {
          await activatePlan(
            userId,
            plan,
            typeof session.customer === "string" ? session.customer : session.customer?.id,
            typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
          );
        } else {
          console.warn("[Stripe] checkout.session.completed zonder userId/plan in metadata");
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await deactivateBySubscriptionId(sub.id);
        break;
      }
      case "customer.subscription.updated": {
        // Statuswijziging (bv. betaling mislukt → past_due, of weer active).
        const sub = event.data.object as Stripe.Subscription;
        const [row] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
          .limit(1);
        if (row) {
          await storage.updateSubscription(row.id, { status: sub.status } as any);
        }
        break;
      }
      default:
        // Overige events negeren we bewust.
        break;
    }
    res.json({ received: true });
  } catch (err: any) {
    console.error(`[Stripe] Fout bij verwerken van ${event.type}:`, err?.message ?? err);
    // 200 terug zodat Stripe niet eindeloos opnieuw probeert bij een
    // niet-herstelbare fout; de fout staat in de logs.
    res.json({ received: true, warning: "verwerkingsfout — zie logs" });
  }
}
