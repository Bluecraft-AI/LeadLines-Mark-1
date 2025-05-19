// Firebase-Supabase Integration Test Script
// Run this in your browser console when logged in to verify the integration

/**
 * Tests the Firebase-Supabase Integration
 * Run this in your browser console when logged in to LeadLines
 */
async function testFirebaseSupabaseIntegration() {
  console.log("==== 🧪 TESTING FIREBASE-SUPABASE INTEGRATION ====");
  
  try {
    // Step 1: Check Firebase Authentication
    console.log("\n1️⃣ Testing Firebase Authentication");
    const firebaseAuth = window.firebase.auth();
    const currentUser = firebaseAuth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found. Please log in first.");
    }
    
    console.log("✅ Firebase Auth: User authenticated successfully");
    console.log(`   Firebase UID: ${currentUser.uid}`);
    console.log(`   Email: ${currentUser.email}`);
    
    // Step 2: Test Supabase Connection
    console.log("\n2️⃣ Testing Supabase Connection");
    const { data: userAssistant, error: assistantError } = await window.supabase
      .from('user_assistants')
      .select('*')
      .limit(1);
    
    if (assistantError) {
      throw new Error(`Supabase connection error: ${assistantError.message}`);
    }
    
    console.log("✅ Supabase Connection: Successfully connected to Supabase");
    
    // Step 3: Test auth_mapping table and functions
    console.log("\n3️⃣ Testing auth_mapping Integration");
    const { data: mappingData, error: mappingError } = await window.supabase
      .rpc('get_or_create_supabase_uuid', {
        p_firebase_uid: currentUser.uid,
        p_email: currentUser.email
      });
    
    if (mappingError) {
      throw new Error(`Auth mapping error: ${mappingError.message}. Make sure you've run the SQL migration script.`);
    }
    
    console.log("✅ Auth Mapping: Successfully mapped Firebase UID to Supabase UUID");
    console.log(`   Supabase UUID: ${mappingData}`);
    
    // Step 4: Test AssistantService with UUID mapping
    console.log("\n4️⃣ Testing AssistantService Integration");
    // This assumes AssistantService is available globally or can be imported
    let assistantService;
    try {
      assistantService = window.AssistantService || (await import('./src/services/AssistantService')).default;
    } catch (e) {
      console.log("⚠️ Couldn't import AssistantService, will test manually");
    }
    
    if (assistantService) {
      const supabaseUuid = await assistantService.getSupabaseUuid();
      console.log("✅ AssistantService: Successfully retrieved Supabase UUID");
      console.log(`   Supabase UUID: ${supabaseUuid}`);
      
      const threads = await assistantService.getThreads();
      console.log(`✅ AssistantService: Retrieved ${threads.length} thread(s)`);
    } else {
      // Manual test
      const { data: supabaseUuid, error: supabaseUuidError } = await window.supabase
        .rpc('get_or_create_supabase_uuid', {
          p_firebase_uid: currentUser.uid,
          p_email: currentUser.email
        });
      
      if (supabaseUuidError) {
        throw new Error(`Manual test error: ${supabaseUuidError.message}`);
      }
      
      const { data: threads, error: threadsError } = await window.supabase
        .from('assistant_threads')
        .select('*')
        .eq('user_id', supabaseUuid)
        .order('created_at', { ascending: false });
      
      if (threadsError) {
        throw new Error(`Manual test error: ${threadsError.message}`);
      }
      
      console.log("✅ Manual Test: Successfully retrieved Supabase UUID and threads");
      console.log(`   Found ${threads.length} thread(s)`);
    }
    
    // Step 5: Test SubmissionsService (still using Firebase UID)
    console.log("\n5️⃣ Testing SubmissionsService Integration");
    
    const { data: submissions, error: submissionsError } = await window.supabase
      .from('csv_submissions')
      .select('*')
      .eq('user_id', currentUser.uid)
      .limit(5);
    
    if (submissionsError) {
      throw new Error(`Submissions test error: ${submissionsError.message}`);
    }
    
    console.log("✅ SubmissionsService: Successfully retrieved submissions with Firebase UID");
    console.log(`   Found ${submissions.length} submission(s)`);
    
    // Final result
    console.log("\n✨ INTEGRATION TEST COMPLETE: All tests passed successfully! ✨");
    console.log("The Firebase-Supabase integration is working correctly.");
    
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    console.error("Please check the implementation steps in IMPLEMENTATION.md and try again.");
  }
}

// Execute the test
testFirebaseSupabaseIntegration().catch(error => {
  console.error("Unhandled error during test:", error);
});

// Instructions for manual execution
console.log("If you're seeing this in the code editor, copy and paste this entire file into your browser console when logged into LeadLines to run the tests."); 