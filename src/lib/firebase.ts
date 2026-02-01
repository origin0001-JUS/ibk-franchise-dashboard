import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyD8eSSRj2UH2sU7kkyD3v2lBZWf83aJmUI",
    authDomain: "ibkbaas-franchise-dashboard.firebaseapp.com",
    projectId: "ibkbaas-franchise-dashboard",
    storageBucket: "ibkbaas-franchise-dashboard.firebasestorage.app",
    messagingSenderId: "1036729387301",
    appId: "1:1036729387301:web:509ebd1f61a87a235872cc",
    measurementId: "G-RDTBLRVFL4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
