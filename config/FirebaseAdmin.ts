// src/config/FirebaseAdmin.ts
import * as admin from 'firebase-admin';
import { Firestore, getFirestore } from 'firebase-admin/firestore'; // Import getFirestore explicitly

let firebaseAppInstance: admin.app.App | undefined; // To hold the initialized app
export let adminDb: Firestore; // To hold the Firestore instance

// Log a marker to confirm this file is being processed
console.log("\n--- STARTING FIREBASE ADMIN SDK MODULE LOAD ---");

if (!admin.apps.length) {
  console.log("Attempting to initialize Firebase Admin SDK (first time)...");
  
  // --- ADDED DETAILED DEBUGGING FOR ENVIRONMENT VARIABLES ---
  console.log("  process.env.FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
  console.log("  process.env.FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
  // Log parts of the private key to confirm it's loaded without exposing the full key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  console.log("  process.env.FIREBASE_PRIVATE_KEY (first 50 chars):", privateKey ? privateKey.substring(0, 50) + '...' : 'N/A');
  console.log("  process.env.FIREBASE_PRIVATE_KEY (last 50 chars):", privateKey ? '...' + privateKey.slice(-50) : 'N/A');
  console.log("  process.env.FIREBASE_PRIVATE_KEY length:", privateKey ? privateKey.length : 'N/A');
  console.log("  process.env.FIREBASE_PRIVATE_KEY contains \\n count (actual newlines):", privateKey ? (privateKey.match(/\n/g) || []).length : 'N/A');
  // --- END ADDED DETAILED DEBUGGING ---

  try {
    firebaseAppInstance = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey, // Use the directly loaded privateKey
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    adminDb = getFirestore(firebaseAppInstance); // Get Firestore from the initialized app instance
    console.log("Firebase Firestore instance obtained successfully.");

  } catch (initError: any) {
    console.error("\n--- FIREBASE ADMIN SDK INITIALIZATION FAILED ---");
    console.error("  Error message:", initError.message);
    console.error("  Error code:", initError.code);
    console.error("  Full error object:", initError);
    console.error("--- END INITIALIZATION FAILED ---");
    // Re-throw the error to ensure the application knows initialization failed
    throw initError;
  }
} else {
  // If already initialized (e.g., during hot reload in dev), reuse existing instance
  firebaseAppInstance = admin.app();
  adminDb = getFirestore(firebaseAppInstance); // Get Firestore from the existing app instance
  console.log("Firebase Admin SDK already initialized. Reusing existing instance.");
}

// This check ensures adminDb is always valid before being exported
if (!adminDb) {
    throw new Error("Firebase Firestore instance could not be established after initialization attempt.");
}

// Export the Firebase Admin App instance (optional, but good practice)
export default firebaseAppInstance;
// No need for `export const adminDb = admin.firestore();` here, as it's defined above.