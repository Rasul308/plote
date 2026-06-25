import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  getDocs,
  limit
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Standard OAuth Scopes
googleProvider.addScope("profile");
googleProvider.addScope("email");

facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");

/**
 * Save or update user profile details in Firestore upon sign-in/sign-up.
 * This ensures the user appears in the Firestore Database user listing.
 */
export async function syncUserProfile(user: FirebaseUser) {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Explorer",
      photoURL: user.photoURL || "",
      providerId: user.providerData[0]?.providerId || "email",
      lastLoginAt: new Date().toISOString(),
    };

    if (!userSnap.exists()) {
      // First-time signup
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        role: "user"
      });
    } else {
      // Returning user
      await setDoc(userRef, userData, { merge: true });
    }
  } catch (error) {
    console.error("Error syncing user profile to Firestore:", error);
  }
}

export type { FirebaseUser };
