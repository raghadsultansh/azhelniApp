const classifyMealType = (meal) => {
  const title = meal.title.toLowerCase();
  const breakfastKeywords = ["pancake", "oat", "egg", "toast", "smoothie", "cereal", "muffin", "yogurt"];
  const lunchKeywords = ["sandwich", "wrap", "burger", "salad", "soup"];
  const dinnerKeywords = ["steak", "roast", "curry", "biryani", "pasta", "grill"];

  const has = (keywords) => keywords.some((word) => title.includes(word));

  if (has(breakfastKeywords)) return "breakfast";
  if (has(lunchKeywords)) return "lunch";
  if (has(dinnerKeywords)) return "dinner";

  return "unspecified";
};
module.exports = {classifyMealType};
// This code defines a function to classify meal types based on keywords found in the meal title.
// It categorizes meals into breakfast, lunch, dinner, or unspecified based on the presence of certain keywords.
