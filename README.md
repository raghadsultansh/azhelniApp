## The Smart Meal Planning App __ازهلني__


is a full-stack mobile application developed for the CS447 App Development course. It helps users generate daily meal plans based on their personal nutrition goals (calories, protein, carbs, fats) and suggests realistic meals that align with typical Saudi household ingredients.

The app uses the **Spoonacular Recipe and Food API** as the meal data source, with backend filtering to exclude recipes containing ingredients uncommon or inappropriate in Saudi/Middle Eastern diets (e.g., bacon, wine). Suggested meals are simple and familiar, all presented through a friendly Arabic interface.


### Key Features

* Set and store daily nutrition goals
* Generate full-day meal suggestions via Spoonacular API
* View ingredients, macros, and recipe instructions
* Mark meals as eaten and track meal history
* Push notifications to remind users to eat on time
* Fully Arabic UI 


###  Tech Stack

* **Frontend**: React Native (Expo), Context API, AsyncStorage
* **Backend**: Node.js, Express.js, FireBase
* **External API**: [Spoonacular Recipe and Food API](https://spoonacular.com/food-api)
* **Notifications**: Expo Push Notifications
