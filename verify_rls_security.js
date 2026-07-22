import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
  process.exit(1);
}

// We require two test accounts already registered/confirmed in the database
const emailA = process.env.TEST_USER_A_EMAIL || "usera@test-rls.com";
const passA = process.env.TEST_USER_A_PASSWORD || "***REMOVED***";

const emailB = process.env.TEST_USER_B_EMAIL || "userb@test-rls.com";
const passB = process.env.TEST_USER_B_PASSWORD || "***REMOVED***";

async function run() {
  console.log("=== SUPABASE RLS SECURITY VERIFICATION TEST ===\n");
  
  // 1. Initialize two isolated clients
  const clientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const clientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  console.log(`Logging in as User A (${emailA})...`);
  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({ email: emailA, password: passA });
  if (errA) {
    console.error("FAIL: User A login failed. Ensure the account exists and is email-confirmed:", errA.message);
    process.exit(1);
  }
  const userAId = authA.user.id;
  console.log(`✓ Logged in. User A UUID: ${userAId}`);

  console.log(`\nLogging in as User B (${emailB})...`);
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({ email: emailB, password: passB });
  if (errB) {
    console.error("FAIL: User B login failed. Ensure the account exists and is email-confirmed:", errB.message);
    process.exit(1);
  }
  const userBId = authB.user.id;
  console.log(`✓ Logged in. User B UUID: ${userBId}`);

  // 2. User A creates a private record in job_applications
  console.log("\n[TEST 1] User A creates a job application...");
  const testJob = {
    user_id: userAId,
    company: "RLS Shield Inc",
    role: "Security Engineer",
    resume_version: "V1_Security",
    status: "Wishlist",
    notes: "This is a highly confidential job application owned by User A."
  };

  const { data: newApp, error: createErr } = await clientA
    .from("job_applications")
    .insert(testJob)
    .select()
    .single();

  if (createErr) {
    console.error("FAIL: User A could not create a job application:", createErr.message);
    process.exit(1);
  }
  const appId = newApp.id;
  console.log(`✓ Application created successfully. App ID: ${appId}`);

  // 3. User B attempts to SELECT User A's private record
  console.log(`\n[TEST 2] User B (${emailB}) attempts to SELECT User A's application (ID: ${appId})...`);
  const { data: selectData, error: selectErr } = await clientB
    .from("job_applications")
    .select("*")
    .eq("id", appId);

  if (selectErr) {
    console.log(`✓ SELECT rejected by policy or failed: ${selectErr.message}`);
  } else if (!selectData || selectData.length === 0) {
    console.log("✓ SUCCESS: SELECT returned 0 rows. Row Level Security successfully hid User A's record from User B!");
  } else {
    console.error("✗ SECURITY VIOLATION: User B was able to read User A's private job application!", selectData);
    allClean = false;
  }

  // 4. User B attempts to UPDATE User A's private record
  console.log(`\n[TEST 3] User B (${emailB}) attempts to UPDATE User A's application status to 'Offer'...`);
  const { data: updateData, error: updateErr, count } = await clientB
    .from("job_applications")
    .update({ status: "Offer" })
    .eq("id", appId)
    .select();

  if (updateErr) {
    console.log(`✓ UPDATE rejected by policy or failed: ${updateErr.message}`);
  } else if (!updateData || updateData.length === 0) {
    console.log("✓ SUCCESS: UPDATE matched 0 rows. Row Level Security successfully prevented User B from modifying User A's record!");
  } else {
    console.error("✗ SECURITY VIOLATION: User B was able to update User A's private job application!", updateData);
  }

  // 5. User B attempts to DELETE User A's private record
  console.log(`\n[TEST 4] User B (${emailB}) attempts to DELETE User A's application...`);
  const { data: deleteData, error: deleteErr } = await clientB
    .from("job_applications")
    .delete()
    .eq("id", appId)
    .select();

  if (deleteErr) {
    console.log(`✓ DELETE rejected by policy or failed: ${deleteErr.message}`);
  } else if (!deleteData || deleteData.length === 0) {
    console.log("✓ SUCCESS: DELETE matched 0 rows. Row Level Security successfully prevented User B from deleting User A's record!");
  } else {
    console.error("✗ SECURITY VIOLATION: User B was able to delete User A's private job application!", deleteData);
  }

  // Cleanup: User A deletes their own application
  console.log("\n[CLEANUP] User A deletes their created application...");
  const { error: cleanupErr } = await clientA
    .from("job_applications")
    .delete()
    .eq("id", appId);
  
  if (cleanupErr) {
    console.warn("Cleanup warning: Failed to delete test application:", cleanupErr.message);
  } else {
    console.log("✓ Cleanup finished. Test application deleted.");
  }

  console.log("\n=== RLS SECURITY VERIFICATION COMPLETED ===");
}

run();
