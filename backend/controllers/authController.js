const { auth, db } = require("../firebase/config");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const { doc, setDoc } = require("firebase/firestore");

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date(),
      calorieGoal: 0,
      carbGoal: 0,
      proteinGoal: 0,
      fatGoal: 0,
    });

    res.status(201).json({ uid: user.uid, email: user.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    res.status(200).json({ uid: user.uid, email: user.email });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };
//this code is for user authentication using Firebase Authentication and Firestore database. 
// It includes functions to register a new user and log in an existing user.
//  The registerUser function creates a new user with email and password, stores the user's information in Firestore, 
// and initializes default goals. The loginUser function authenticates the user and returns their UID and email. 
// Error handling is included to manage any issues during registration or login.