import { storage } from "@server/storage";
import { db } from "@server/db";
import { trades, parties, tradeParties } from "@shared/schema";

/**
 * Seeds demo data for a newly created organization during quick onboarding.
 * This function is idempotent — it checks org.demoSeeded before seeding.
 */
export async function seedDemoDataForOrg(orgId: string): Promise<boolean> {
  const org = await storage.getOrg(orgId);
  if (!org) return false;
  if (org.demoSeeded) return false; // Already seeded

  try {
    // Create demo parties
    const [exporter] = await db.insert(parties).values({
      name: "Demo Exporter Co.",
      type: "supplier",
      country: "Brazil",
      capabilities: ["coffee", "cocoa", "sugar"],
    }).returning();

    const [importer] = await db.insert(parties).values({
      name: "Demo Importer Ltd.",
      type: "buyer",
      country: "Netherlands",
      capabilities: ["import", "distribution", "warehousing"],
    }).returning();

    const [financier] = await db.insert(parties).values({
      name: "Demo Trade Finance Bank",
      type: "financier",
      country: "UK",
      capabilities: ["letter-of-credit", "trade-finance", "working-capital"],
    }).returning();

    // Create demo trade
    const [demoTrade] = await db.insert(trades).values({
      title: "Demo: Coffee Export - Brazil to Netherlands",
      origin: "Brazil",
      destination: "Netherlands",
      value: "150000",
      currency: "USD",
      status: "active",
      commodity: "Arabica Coffee",
      incoterm: "CIF",
    }).returning();

    // Link parties to trade
    await db.insert(tradeParties).values([
      { tradeId: demoTrade.id, partyId: exporter!.id, roles: ["exporter", "seller"] },
      { tradeId: demoTrade.id, partyId: importer!.id, roles: ["importer", "buyer"] },
      { tradeId: demoTrade.id, partyId: financier!.id, roles: ["financier"] },
    ]);

    // Mark org as demo seeded
    await storage.updateOrg(orgId, { demoSeeded: true });

    console.log(`[demo-seed] Demo data seeded for org ${orgId}`);
    return true;
  } catch (error) {
    console.error(`[demo-seed] Error seeding demo data for org ${orgId}:`, error);
    return false;
  }
}
