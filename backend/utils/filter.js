const forbiddenStrict = [
  "pork", "ham", "sausage", "pepperoni", "lard", "prosciutto", "gelatin",
  "wine", "alcohol", "beer", "vodka", "rum", "brandy", "bourbon"
];

const replacements = {
  bacon: "beef bacon",
  pancetta: "beef pancetta",
  chorizo: "halal beef chorizo",
  hotdog: "halal hotdog",
  gelatin: "halal gelatin"
};

const isStrictlyForbidden = (text) =>
  forbiddenStrict.some(item => text.includes(item));

const replaceIngredient = (name) => {
  const lower = name.toLowerCase();
  for (let [bad, good] of Object.entries(replacements)) {
    if (lower.includes(bad)) {
      return name.replace(new RegExp(bad, 'gi'), good);
    }
  }
  return name;
};

const filterHalalMeals = (meals) => {
  return meals.filter(meal => {
    const title = meal.title.toLowerCase();
    if (isStrictlyForbidden(title)) return false;

    const ingredients = meal.ingredients || [];
    for (let ing of ingredients) {
      const name = ing.name.toLowerCase();
      if (isStrictlyForbidden(name)) return false;
    }

    return true;
  }).map(meal => {
    if (meal.ingredients) {
      meal.ingredients = meal.ingredients.map(ing => ({
        ...ing,
        name: replaceIngredient(ing.name)
      }));
    }
    return meal;
  });
};

module.exports = { filterHalalMeals };
//this code filters out meals that contain forbidden ingredients for halal diets. 
// It checks both the meal title and the ingredients, replacing certain terms with halal alternatives where applicable.
