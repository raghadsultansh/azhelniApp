const { db } = require("../firebase/config");
const { doc, updateDoc, getDoc } = require("firebase/firestore");

const updateGoals = async (req, res) => {
  const { uid, calorieGoal, carbGoal, proteinGoal, fatGoal } = req.body;

  if (!uid || !calorieGoal || !carbGoal || !proteinGoal || !fatGoal) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      goals: {
        calorieGoal,
        carbGoal,
        proteinGoal,
        fatGoal,
      },
    });

    res.status(200).json({ message: "Goals updated successfully" });
  } catch (error) {
    console.error("❌ Failed to update goals:", error);
    res.status(500).json({ error: "Failed to update goals" });
  }
};

const getUserGoals = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnap.data();
    const goals = userData.goals || null;

    res.status(200).json(goals);
  } catch (error) {
    console.error("❌ Failed to fetch user goals:", error);
    res.status(500).json({ error: "Failed to fetch user goals" });
  }
};

module.exports = {
  updateGoals,
  getUserGoals,
};
