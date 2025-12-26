/**
 * Test script for email functionality
 *
 * Usage:
 * 1. Replace the admin credentials and test email below
 * 2. Run: npx tsx src/scripts/test-email.ts
 *
 * Prerequisites:
 * - Firebase Functions deployed with sendEnergyConsumptionEmail function
 * - Mandrill API key configured in Firebase Secret Manager
 * - Admin user credentials for authentication
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { SendConsumptionEmailRequest, EmailResult } from '../shared/types/email.types';

// Firebase configuration (from .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'europe-west1');

async function testEmail() {
  console.log('🚀 Starting email test...\n');

  try {
    // Step 1: Authenticate
    console.log('📝 Step 1: Authenticating...');
    const adminEmail = 'admin@home2students.pt'; // Replace with actual admin email
    const adminPassword = 'your-admin-password'; // Replace with actual password

    const userCredential = await signInWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    console.log('✅ Authenticated as:', userCredential.user.email);
    console.log('');

    // Step 2: Prepare test data
    console.log('📝 Step 2: Preparing test email data...');
    const testData: SendConsumptionEmailRequest = {
      to: 'test@example.com', // Replace with test email address
      subject: '', // Will be set by the function
      studentName: 'João Silva',
      consumptionKwh: 350,
      contractMonthlyLimit: 300,
      excessKwh: 50,
      billingPeriod: 'December 2025',
      roomNumber: '101',
      residenceName: 'Residência Lisboa Centro',
      exceedsLimit: true, // Test with exceeded limit
    };

    console.log('Test data:', JSON.stringify(testData, null, 2));
    console.log('');

    // Step 3: Call the function
    console.log('📝 Step 3: Sending test email via Cloud Function...');
    const sendEmailFn = httpsCallable<SendConsumptionEmailRequest, EmailResult>(
      functions,
      'sendEnergyConsumptionEmail'
    );

    const result = await sendEmailFn(testData);
    console.log('');

    // Step 4: Check result
    console.log('📝 Step 4: Checking result...');
    if (result.data.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', result.data.messageId);
      console.log('   Retry count:', result.data.retryCount);
      console.log('');
      console.log('🎉 Test completed successfully!');
      console.log('   Check Mandrill dashboard for email delivery status');
      console.log('   Check recipient inbox:', testData.to);
    } else {
      console.error('❌ Email failed:', result.data.error);
      console.log('');
      console.log('💡 Troubleshooting tips:');
      console.log('   - Check Mandrill API key in Firebase Secret Manager');
      console.log('   - Verify templates exist in Mandrill dashboard');
      console.log('   - Check Firebase Functions logs for errors');
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('');
    console.error('❌ Test failed with error:', errorMessage);
    console.log('');
    console.log('💡 Common issues:');
    console.log('   - Invalid credentials: Check admin email/password');
    console.log('   - Function not deployed: Run "firebase deploy --only functions"');
    console.log('   - Permissions error: Ensure user has admin role');
    console.log('   - Network error: Check internet connection');
    console.error('');
    console.error('Full error:', error);
  }
}

// Run the test
testEmail().then(() => {
  console.log('');
  console.log('Test script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
