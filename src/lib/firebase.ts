// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDfZYI7o9a0D5a3OlG-n2X6gxngnVll4ks',
  authDomain: 'planning-poker-clone-fe224.firebaseapp.com',
  databaseURL:
    'https://planning-poker-clone-fe224-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'planning-poker-clone-fe224',
  storageBucket: 'planning-poker-clone-fe224.appspot.com',
  messagingSenderId: '820267698753',
  appId: '1:820267698753:web:108fd220ad99eb301614c0',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
