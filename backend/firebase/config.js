const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
require("dotenv").config();

const firebaseConfig = {
  apiKey: "AIzaSyChF6Z6qCEywlskunBT9bwRBEB8nxG0GCY",
  authDomain: "azhelni-4a3bc.firebaseapp.com",
  projectId: "azhelni-4a3bc",
  storageBucket: "azhelni-4a3bc.firebasestorage.app",
  messagingSenderId: "705096020723",
  appId: "1:705096020723:web:50948ad460edfa3264fd86"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };
//this code initializes a Firebase application using the Firebase SDK.
// It imports necessary modules, sets up the Firebase configuration with API keys and project details,
// and initializes the Firebase app, authentication, and Firestore database.