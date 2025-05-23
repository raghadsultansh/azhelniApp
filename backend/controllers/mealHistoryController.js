const { db } = require("../firebase/config");
const {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} = require("firebase/firestore");

const saveMealHistory = async (req, res) => {
  const { uid, date, totalMacros, meals, goals } = req.body;

  if (!uid || !date || !totalMacros || !meals || !goals) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const historyRef = doc(db, "users", uid, "mealHistory", date);
    const historySnap = await getDoc(historyRef);

    let updatedMeals = [];
    let updatedTotalMacros = { ...totalMacros };

    if (historySnap.exists()) {
      const existingData = historySnap.data();
      const existingMeals = existingData.meals || [];
      updatedMeals = [...existingMeals];

      meals.forEach((newMeal) => {
        if (!existingMeals.some((m) => m.id === newMeal.id)) {
          updatedMeals.push(newMeal);
        }
      });

      updatedTotalMacros = updatedMeals.reduce(
        (sum, meal) => ({
          calories: sum.calories + (meal.nutrition?.calories || 0),
          protein: sum.protein + (meal.nutrition?.protein || 0),
          carbs: sum.carbs + (meal.nutrition?.carbohydrates || 0),
          fat: sum.fat + (meal.nutrition?.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
    } else {
      updatedMeals = meals;
    }

    await setDoc(historyRef, {
      date,
      totalMacros: updatedTotalMacros,
      meals: updatedMeals,
    });

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    let streak = 0;
    let lastStreakDate = null;
    if (userSnap.exists()) {
      streak = userSnap.data().streak || 0;
      lastStreakDate = userSnap.data().lastStreakDate || null;
    }

    const metMacros =
      Math.abs(updatedTotalMacros.calories - goals.calorieGoal) / goals.calorieGoal < 0.1 &&
      Math.abs(updatedTotalMacros.protein - goals.proteinGoal) / goals.proteinGoal < 0.1 &&
      Math.abs(updatedTotalMacros.carbs - goals.carbGoal) / goals.carbGoal < 0.1 &&
      Math.abs(updatedTotalMacros.fat - goals.fatGoal) / goals.fatGoal < 0.1;

    const today = date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (metMacros) {
      if (lastStreakDate === yesterday) {
        streak += 1;
      } else if (lastStreakDate === today) {
      } else {
        streak = 1;
      }
      lastStreakDate = today;
    } else {
      streak = 0;
      lastStreakDate = today;
    }

    await updateDoc(userRef, { streak, lastStreakDate });

    res.status(200).json({ message: "Meal history saved successfully.", streak });
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

const getAllMealHistory = async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: "uid is required" });

  try {
    const historyCol = collection(db, "users", uid, "mealHistory");
    const snapshot = await getDocs(historyCol);
    const history = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      history.push({ ...data, date: data.date });
    });
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meal history." });
  }
};

module.exports = {
  saveMealHistory,
  getMealHistory,
  updateMealStatus,
  getAllMealHistory,
};
// /this code is for managing meal history in a Firebase Firestore database.
// It includes functions to save meal history, retrieve it for a specific date,
// and update the status of a specific meal.