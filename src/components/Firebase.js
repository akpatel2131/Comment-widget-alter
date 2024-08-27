import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useCallback } from "react";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9IwVXgisi5TD2fNwZiTyvmdkKVmmhZ1c",
  authDomain: "comment-widget-25f1a.firebaseapp.com",
  projectId: "comment-widget-25f1a",
  storageBucket: "comment-widget-25f1a.appspot.com",
  messagingSenderId: "35500114771",
  appId: "1:35500114771:web:047beca4dfd98efe9f17a6",
  measurementId: "G-BR8Y3FYG25"
};

export default function useGoogleAuth() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // Authentication functions
  const googleProvider = new GoogleAuthProvider();

  const signInWithGoogle = useCallback(async () => {
    try {
      const response = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("authToken", response._tokenResponse.oauthAccessToken	)
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  }, [auth, googleProvider]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  },[auth]);

  return { auth, db, storage, signInWithGoogle, logout };
}
