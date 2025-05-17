const { db } = require("../firebase/config");
const {
  doc,
  setDoc,
  getDoc,
  collection,
  updateDoc,
} = require("firebase/firestore");

const saveMealHistory = async (req, res) => {
  const { uid, date, totalMacros, meals } = req.body;

  if (!uid || !date || !totalMacros || !meals) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const historyRef = doc(db, "users", uid, "mealHistory", date);

    await setDoc(historyRef, {
      date,
      totalMacros,
      meals,
    });

    res.status(200).json({ message: "Meal history saved successfully." });
  } catch (error) {
    console.error("Error saving meal history:", error);
    res.status(500).json({ error: "Failed to save meal history." });
  }
};

const getMealHistory = async (req, res) => {
  const { uid, date } = req.query;

  try {
    if (!uid || !date) {
      return res.status(400).json({ error: "uid and date are required" });
    }

    const historyRef = doc(db, "users", uid, "mealHistory", date);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) {
      return res
        .status(404)
        .json({ error: "No meal history found for this date." });
    }

    res.status(200).json(historySnap.data());
  } catch (error) {
    console.error("Error fetching meal history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMealStatus = async (req, res) => {
  const { uid, date, mealTitle, newStatus } = req.body;

  if (!uid || !date || !mealTitle || !newStatus) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const historyRef = doc(db, "users", uid, "mealHistory", date);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) {
      return res.status(404).json({ error: "Meal history not found." });
    }

    const historyData = historySnap.data();
    const updatedMeals = historyData.meals.map((meal) => {
      if (meal.title === mealTitle) {
        return { ...meal, status: newStatus };
      }
      return meal;
    });

    await updateDoc(historyRef, { meals: updatedMeals });

    res.status(200).json({ message: "Meal status updated successfully." });
  } catch (error) {
    console.error("Error updating meal status:", error);
    res.status(500).json({ error: "Failed to update meal status." });
  }
};

module.exports = {
  saveMealHistory,
  getMealHistory,
  updateMealStatus,
};
// /this code is for managing meal history in a Firebase Firestore database.
// It includes functions to save meal history, retrieve it for a specific date,
// and update the status of a specific meal.