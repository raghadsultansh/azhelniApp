const express = require("express");
const router = express.Router();
const { updateGoals, getUserGoals  } = require("../controllers/userController");

router.post("/goals", updateGoals);
router.get("/:uid", getUserGoals)

module.exports = router;
// This code defines the routes for updating and retrieving user goals in a Node.js application using Express.