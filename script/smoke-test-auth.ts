/**
 * Smoke test script for TRAIBOX auth & onboarding
 * Run: npx tsx script/smoke-test-auth.ts
 * 
 * Prerequisites:
 *   - App running at BASE_URL (default http://localhost:3000)
 *   - DATABASE_URL set
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (e: any) {
    results.push({ name, passed: false, error: e.message });
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

let sessionCookie = "";
let orgId = "";

async function fetchJson(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (sessionCookie) {
    headers["Cookie"] = sessionCookie;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, redirect: "manual" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie && setCookie.includes("tb-session=")) {
    sessionCookie = setCookie.split(";")[0];
  }
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text };
  }
}

async function main() {
  const testEmail = `smoke-test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  console.log("\n🔬 TRAIBOX Auth & Onboarding Smoke Tests\n");
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Test user: ${testEmail}\n`);

  // Test 1: Quick signup
  await test("Quick signup creates user and org", async () => {
    const { status, data } = await fetchJson("/api/auth/signup-quick", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: "Smoke",
        lastName: "Test",
        companyName: "Test Corp",
      }),
    });
    assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
    assert(data.user?.email === testEmail, "User email mismatch");
    assert(data.user?.role === "ops", "Default role should be ops");
    assert(data.org?.onboardingStatus === "demo_active", "Org should be in demo_active");
    orgId = data.org?.id;
  });

  // Test 2: Session check
  await test("Session returns authenticated user", async () => {
    const { status, data } = await fetchJson("/api/auth/me");
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.user?.email === testEmail, "Session user email mismatch");
    assert(data.org?.onboardingStatus === "demo_active", "Org should be demo_active");
  });

  // Test 3: Demo seed
  await test("Demo seed runs for demo org", async () => {
    const { status, data } = await fetchJson("/api/auth/seed-demo", { method: "POST" });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.seeded === true, "Should return seeded=true");
  });

  // Test 4: Idempotent demo seed
  await test("Demo seed is idempotent", async () => {
    const { status, data } = await fetchJson("/api/auth/seed-demo", { method: "POST" });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.seeded === false, "Should return seeded=false on second call");
  });

  // Test 5: Duplicate signup
  await test("Duplicate signup returns 409", async () => {
    sessionCookie = "";
    const { status } = await fetchJson("/api/auth/signup-quick", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    assert(status === 409, `Expected 409, got ${status}`);
  });

  // Test 6: Login
  await test("Login works with correct credentials", async () => {
    const { status, data } = await fetchJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
    assert(data.user?.email === testEmail, "Login user email mismatch");
  });

  // Test 7: Wrong password
  await test("Login fails with wrong password", async () => {
    const { status } = await fetchJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: "wrongpassword" }),
    });
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // Test 8: Finance policy requires finance role
  await test("Finance policy update requires finance role (ops gets 403)", async () => {
    const { status } = await fetchJson("/api/v1/finance/policy", {
      method: "POST",
      body: JSON.stringify({ maxNegotiationAmount: 100000 }),
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  // Test 9: Payment approval requires finance role
  await test("Payment approval requires finance role (ops gets 403)", async () => {
    const { status } = await fetchJson("/api/v1/payments/test-payment/approve", {
      method: "POST",
    });
    assert(status === 403, `Expected 403, got ${status}`);
  });

  // Test 10: Complete onboarding
  await test("Full onboarding completion updates org status", async () => {
    const { status, data } = await fetchJson("/api/auth/complete-onboarding", {
      method: "POST",
      body: JSON.stringify({
        legalName: "Test Corp International",
        country: "US",
        fullName: "Smoke Test User",
        jobTitle: "Tester",
      }),
    });
    assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
    assert(data.success === true, "Should return success=true");
  });

  // Test 11: Verify onboarding complete in session
  await test("Session reflects full_complete after onboarding", async () => {
    const { status, data } = await fetchJson("/api/auth/me");
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.org?.onboardingStatus === "full_complete", `Expected full_complete, got ${data.org?.onboardingStatus}`);
    assert(data.user?.onboardingStatus === "full_complete", `Expected full_complete, got ${data.user?.onboardingStatus}`);
  });

  // Test 12: Logout
  await test("Logout clears session", async () => {
    const { status } = await fetchJson("/api/auth/logout", { method: "POST" });
    assert(status === 200, `Expected 200, got ${status}`);
  });

  // Test 13: Unauthenticated access
  await test("Unauthenticated /api/auth/me returns 401", async () => {
    sessionCookie = "";
    const { status } = await fetchJson("/api/auth/me");
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} tests\n`);

  if (failed > 0) {
    console.log("Failed tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  ✗ ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
