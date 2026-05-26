import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvgTHO9WZA8_DnVPNzKFelwURtyGqlKAs",
    authDomain: "soul-joyeria.firebaseapp.com",
    projectId: "soul-joyeria",
    storageBucket: "soul-joyeria.firebasestorage.app",
    messagingSenderId: "120513073976",
    appId: "1:120513073976:web:3ec1f3cd09c30de68d67cd"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);