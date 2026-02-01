import { db } from "./db";
import { trades, parties, tradeParties } from "@shared/schema";

export async function seedDatabase() {
  const existingTrades = await db.select().from(trades).limit(1);
  if (existingTrades.length > 0) {
    console.log("[seed] Database already has data, skipping seed");
    return;
  }

  console.log("[seed] Seeding database with demo data...");

  const [supplier] = await db.insert(parties).values({
    name: "Cocoa Farmers Cooperative",
    type: "supplier",
    country: "Ghana",
    capabilities: ["cocoa", "organic", "fair-trade"],
  }).returning();

  const [buyer] = await db.insert(parties).values({
    name: "Hamburg Chocolate GmbH",
    type: "buyer",
    country: "Germany",
    capabilities: ["import", "processing", "distribution"],
  }).returning();

  const [bank] = await db.insert(parties).values({
    name: "Trade Finance Bank",
    type: "financier",
    country: "UK",
    capabilities: ["letter-of-credit", "trade-finance", "escrow"],
  }).returning();

  const [shipper] = await db.insert(parties).values({
    name: "GlobalFreight Logistics",
    type: "logistics",
    country: "Netherlands",
    capabilities: ["ocean-freight", "customs", "tracking"],
  }).returning();

  const [trade1] = await db.insert(trades).values({
    title: "Cocoa Export - Ghana to Germany",
    origin: "Ghana",
    destination: "Germany",
    value: "250000",
    currency: "USD",
    status: "active",
    commodity: "Cocoa Beans",
    incoterm: "CIF",
  }).returning();

  const [trade2] = await db.insert(trades).values({
    title: "Coffee Import - Ethiopia to Italy",
    origin: "Ethiopia",
    destination: "Italy",
    value: "85000",
    currency: "EUR",
    status: "draft",
    commodity: "Green Coffee",
    incoterm: "FOB",
  }).returning();

  await db.insert(tradeParties).values([
    { tradeId: trade1.id, partyId: supplier!.id, roles: ["exporter", "seller"] },
    { tradeId: trade1.id, partyId: buyer!.id, roles: ["importer", "buyer"] },
    { tradeId: trade1.id, partyId: bank!.id, roles: ["financier"] },
    { tradeId: trade1.id, partyId: shipper!.id, roles: ["logistics"] },
  ]);

  console.log("[seed] Database seeded successfully");
  console.log(`[seed] Created ${2} trades, ${4} parties`);
}
