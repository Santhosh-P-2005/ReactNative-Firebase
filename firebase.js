import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCk8UizTrp0xSKe2xGFqKs3kJl1-u6lp18",
    authDomain: "paint-shop-5b154.firebaseapp.com",
    projectId: "paint-shop-5b154",
    storageBucket: "paint-shop-5b154.appspot.com",
    messagingSenderId: "25874112479",
    appId: "1:2587412479:web:359f4d9911443626defae6a",
    measurementId: "G-VXTXEJ13DG"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

const connectToDatabase = () => {
    try {
        return db;
    } catch (err) {
        console.error("Failed to connect to Firestore:", err);
    }
};

export { auth, connectToDatabase, storage };
