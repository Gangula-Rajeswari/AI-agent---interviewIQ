

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-35815.firebaseapp.com",
  projectId: "interviewiq-35815",
  storageBucket: "interviewiq-35815.firebasestorage.app",
  messagingSenderId: "351998106503",
  appId: "1:351998106503:web:11618b67605d48365b9122",
  measurementId: "G-RX51F9RV8F"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

provider.addScope("email");
provider.addScope("profile");

export { auth, provider };
