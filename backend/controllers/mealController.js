const axios = require("axios");
const path = require("path");
const { filterHalalMeals } = require("../utils/filter");
const { classifyMealType } = require("../utils/classifyMealType");
require("dotenv").config();
const { db } = require("../firebase/config");
const { doc, setDoc, getDoc } = require("firebase/firestore");

const generateMeals = async (req, res) => {
  const { calorieGoal, proteinGoal, carbGoal, fatGoal } = req.body;
  // // just to test remove later 
  // return res.json({
  //   meals: [
  //     {
  //       id: 1101,
  //       title: "Grilled Chicken with Quinoa & Veggies",
  //       image: "chicken_quinoa", 
  //       readyInMinutes: 30,
  //       servings: 1,
  //       ingredients: [
  //         { name: "Chicken Breast", amount: "150g" },
  //         { name: "Quinoa", amount: "1/2 cup" },
  //         { name: "Bell Peppers", amount: "1/2 cup (chopped)" },
  //         { name: "Olive Oil", amount: "1 tbsp" },
  //         { name: "Garlic", amount: "1 clove (minced)" }
  //       ],
  //       nutrition: {
  //         calories: 450,
  //         protein: 42,
  //         carbohydrates: 30,
  //         fat: 18
  //       },
  //       instructions:
  //         "1. Season chicken with olive oil, garlic, and a pinch of salt. 2. Grill on both sides until fully cooked (about 5-6 minutes per side). 3. Cook quinoa according to instructions. 4. Sauté bell peppers in olive oil for 3 mins. 5. Plate quinoa, top with chicken and peppers."
  //     },
  //     {
  //       id: 1102,
  //       title: "Lentil Soup with Toasted Bread",
  //       image: "/assets/images/lentil_soup.jpg",
  //       readyInMinutes: 25,
  //       servings: 2,
  //       ingredients: [
  //         { name: "Red Lentils", amount: "1 cup" },
  //         { name: "Onion", amount: "1 small (diced)" },
  //         { name: "Carrot", amount: "1 medium (chopped)" },
  //         { name: "Cumin", amount: "1 tsp" },
  //         { name: "Olive Oil", amount: "1 tbsp" }
  //       ],
  //       nutrition: {
  //         calories: 320,
  //         protein: 20,
  //         carbohydrates: 40,
  //         fat: 8
  //       },
  //       instructions:
  //         "1. Sauté onion and carrot in olive oil until soft. 2. Add lentils, cumin, and 3 cups of water. 3. Cook on medium for 20 minutes. 4. Blend partially for a thick texture. 5. Serve with toasted bread."
  //     },
  //     {
  //       id: 1103,
  //       title: "Oatmeal with Banana and Almond Butter",
  //       image: "/assets/images/oatmeal_banana.jpg",
  //       readyInMinutes: 10,
  //       servings: 1,
  //       ingredients: [
  //         { name: "Rolled Oats", amount: "1/2 cup" },
  //         { name: "Milk", amount: "1 cup" },
  //         { name: "Banana", amount: "1 sliced" },
  //         { name: "Almond Butter", amount: "1 tbsp" },
  //         { name: "Honey", amount: "1 tsp (optional)" }
  //       ],
  //       nutrition: {
  //         calories: 380,
  //         protein: 12,
  //         carbohydrates: 48,
  //         fat: 14
  //       },
  //       instructions:
  //         "1. Cook oats with milk over medium heat for 5-7 minutes. 2. Pour into bowl, top with banana slices. 3. Drizzle almond butter and honey on top. Serve warm."
  //     }
  //   ]
  // });

  try {
    const planResponse = await axios.get(
      "https://api.spoonacular.com/mealplanner/generate",
      {
        params: {
          timeFrame: "day",
          targetCalories: calorieGoal,
          apiKey: process.env.SPOONACULAR_API_KEY,
        },
      }
    );

    const allMeals = filterHalalMeals(planResponse.data?.meals || []).slice(
      0,
     60
    );

    const convertToGrams = (amount, unit) => {
      unit = unit.toLowerCase();

      if (["tsp", "tbsp", "teaspoon", "tablespoon"].includes(unit)) {
        return `${Math.round(amount)} ${unit}`;
      }

      const conversions = {
        cup: 240,
        ounce: 28,
        oz: 28,
        lb: 454,
        pound: 454,
        grams: 1,
        gram: 1,
        g: 1,
      };

      const grams = conversions[unit] ? amount * conversions[unit] : amount;
      return `${Math.round(grams)} g`;
    };
    const detailedMeals = await Promise.all(
      allMeals.map(async (meal) => {
        const info = await axios.get(
          `https://api.spoonacular.com/recipes/${meal.id}/information`,
          {
            params: {
              apiKey: process.env.SPOONACULAR_API_KEY,
              includeNutrition: true,
            },
          }
        );

        const nutrients = info.data.nutrition.nutrients.reduce((acc, n) => {
          if (
            ["Calories", "Protein", "Carbohydrates", "Fat"].includes(n.name)
          ) {
            acc[n.name.toLowerCase()] = n.amount;
          }
          return acc;
        }, {});

        return {
          id: meal.id,
          title: meal.title,
          image: info.data.image,
          sourceUrl: info.data.sourceUrl,
          readyInMinutes: info.data.readyInMinutes,
          servings: info.data.servings,
          ingredients: info.data.extendedIngredients.map((i) => ({
            name: i.name.toLowerCase().trim(),
            amount: convertToGrams(i.amount, i.unit),
          })),
          nutrition: nutrients,
          instructions: info.data.instructions || "", 
        };
      })
    );

    detailedMeals.sort((a, b) => b.nutrition.protein - a.nutrition.protein);

    let bestCombo = null;
    let bestTotal = null;
    let lowestPenalty = Infinity;

    for (let i = 0; i < detailedMeals.length; i++) {
      for (let j = i + 1; j < detailedMeals.length; j++) {
        for (let k = j + 1; k < detailedMeals.length; k++) {
          const combo = [detailedMeals[i], detailedMeals[j], detailedMeals[k]];

          const totals = combo.reduce(
            (sum, meal) => ({
              calories: sum.calories + meal.nutrition.calories,
              protein: sum.protein + meal.nutrition.protein,
              carbs: sum.carbs + meal.nutrition.carbohydrates,
              fat: sum.fat + meal.nutrition.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );

          const penalty =
            Math.abs(totals.calories - calorieGoal) +
            Math.abs(totals.protein - proteinGoal) * 4 + // prioritize protein
            Math.abs(totals.carbs - carbGoal) +
            Math.abs(totals.fat - fatGoal);

          if (penalty < lowestPenalty) {
            lowestPenalty = penalty;
            bestCombo = combo;
            bestTotal = totals;
          }
        }
      }
    }

    if (!bestCombo) {
      return res
        .status(404)
        .json({ error: "No suitable meal combination found." });
    }

    const mealTypes = {
      breakfast: null,
      lunch: null,
      dinner: null,
    };
    const unassigned = [];

    for (const meal of bestCombo) {
      const type = classifyMealType(meal);
      if (type === "breakfast" && !mealTypes.breakfast) {
        mealTypes.breakfast = { ...meal, mealType: "breakfast" };
      } else if (type === "lunch" && !mealTypes.lunch) {
        mealTypes.lunch = { ...meal, mealType: "lunch" };
      } else if (type === "dinner" && !mealTypes.dinner) {
        mealTypes.dinner = { ...meal, mealType: "dinner" };
      } else {
        unassigned.push(meal);
      }
    }

    ["breakfast", "lunch", "dinner"].forEach((type, idx) => {
      if (!mealTypes[type] && unassigned[idx]) {
        mealTypes[type] = { ...unassigned[idx], mealType: type };
      }
    });

    ["breakfast", "lunch", "dinner"].forEach((type) => {
      if (!mealTypes[type]) {
        const notAssigned = bestCombo.find(
          (meal) => !Object.values(mealTypes).some((m) => m && m.id === meal.id)
        );
        if (notAssigned) {
          mealTypes[type] = { ...notAssigned, mealType: type };
        }
      }
    });

    const finalMeals = Object.values(mealTypes).filter(Boolean);

    const today = new Date().toISOString().slice(0, 10);
    const userId = req.body.uid;

    if (userId) {
      const generatedRef = doc(db, "users", userId, "generatedMeals", today);
      await setDoc(generatedRef, {
        date: today,
        meals: finalMeals,
        totalMacros: {
          calories: Math.round(bestTotal.calories),
          protein: Math.round(bestTotal.protein),
          carbs: Math.round(bestTotal.carbs),
          fat: Math.round(bestTotal.fat),
        },
      });
    }

    res.status(200).json({
      meals: finalMeals,
      totalMacros: {
        calories: Math.round(bestTotal.calories),
        protein: Math.round(bestTotal.protein),
        carbs: Math.round(bestTotal.carbs),
        fat: Math.round(bestTotal.fat),
      },
    });
  } catch (error) {
    console.error(
      "Error generating meals:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
};

const getGeneratedMeals = async (req, res) => {
  const { uid, date } = req.query;
  if (!uid || !date) return res.status(400).json({ error: "uid and date required" });

  try {
    const ref = doc(db, "users", uid, "generatedMeals", date);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ meals: [] });
    res.status(200).json(snap.data());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch generated meals" });
  }
};

module.exports = { generateMeals, getGeneratedMeals };
//this code is for generating a meal plan based on user-defined macronutrient goals using the Spoonacular API.
// It fetches meal data, filters halal options, and calculates the best combination of meals to meet the goals.
// The meals are classified into breakfast, lunch, and dinner types.
// The code also includes error handling for API requests and data processing.
// The final meal plan is returned with the total macronutrient values.
// The code uses axios for API requests and dotenv for environment variable management.
// The generateMeals function is the main function that handles the meal generation process.
