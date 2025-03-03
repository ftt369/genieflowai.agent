import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { FirebaseUser } from '../types/firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Email & Password Sign Up
  async signUpWithEmail(email: string, password: string, fullName: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await this.createUserProfile(userCredential.user, { fullName });
  },

  // Email & Password Sign In
  async signInWithEmail(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  },

  // Google Sign In
  async signInWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(auth, googleProvider);
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
    
    if (isNewUser) {
      await this.createUserProfile(user, {
        fullName: user.displayName || '',
      });
    }
    
    return user;
  },

  // Sign Out
  async signOut(): Promise<void> {
    await signOut(auth);
  },

  // Password Reset
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Create User Profile
  private async createUserProfile(user: User, additionalData: { fullName: string }): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userData: FirebaseUser = {
      uid: user.uid,
      email: user.email!,
      fullName: additionalData.fullName,
      avatarUrl: user.photoURL || undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      role: 'user',
    };

    await setDoc(userRef, userData);
  },

  // Auth State Observer
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
}; 