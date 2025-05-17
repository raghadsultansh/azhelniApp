const { db } = require("../firebase/config");
const { doc, updateDoc , getDoc} = require("firebase/firestore");

const updateGoals = async (req, res) => {
  const { uid, calorieGoal, carbGoal, proteinGoal, fatGoal } = req.body;

  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      calorieGoal,
      carbGoal,
      proteinGoal,
      fatGoal,
    });

    res.status(200).json({ message: "Goals updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserGoals = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      res.status(200).json(userSnap.data());
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { updateGoals , getUserGoals };
//this code is for updating and retrieving user goals in a Firebase Firestore database.
// The updateGoals function updates the user's macronutrient goals (calories, carbs, protein, fat) in the database.
// The getUserGoals function retrieves the user's goals based on their UID.
// Both functions handle errors and respond with appropriate status codes and messages.
