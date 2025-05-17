const express = require("express");
const router = express.Router();
const { generateMeals } = require("../controllers/mealController");
const {
  saveMealHistory,
  getMealHistory,
  updateMealStatus,
} = require("../controllers/mealHistoryController");

router.post("/generate", generateMeals);
router.post("/history", saveMealHistory);
router.get("/history", getMealHistory);
router.patch("/history/status", updateMealStatus);
module.exports = router;
//this code defines the routes for meal generation and meal history management in a Node.js application using Express. It imports the necessary controllers and sets up the routes for generating meals, saving meal history, fetching meal history, and updating meal status. The router is then exported for use in the main application file.