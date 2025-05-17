const axios = require("axios");
const { filterHalalMeals } = require("../utils/filter");
const { classifyMealType } = require("../utils/classifyMealType");
require("dotenv").config();

const generateMeals = async (req, res) => {
  const { calorieGoal, proteinGoal, carbGoal, fatGoal } = req.body;

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

module.exports = { generateMeals };
//this code is for generating a meal plan based on user-defined macronutrient goals using the Spoonacular API.
// It fetches meal data, filters halal options, and calculates the best combination of meals to meet the goals.
// The meals are classified into breakfast, lunch, and dinner types.
// The code also includes error handling for API requests and data processing.
// The final meal plan is returned with the total macronutrient values.
// The code uses axios for API requests and dotenv for environment variable management.
// The generateMeals function is the main function that handles the meal generation process.
