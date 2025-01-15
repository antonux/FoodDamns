import GeneratingRecipes from "./generatingRecipes";
import GeneratingViewRecipe from "./generatingViewRecipe";
import React, { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

const RecipeCard = ({
  onSubmit,
  onFiveSubmit,
  viewRecipe,
  canView,
  fiveRecipeText,
  cuisines,
}) => {
  const [isGeneratingRecipesModal, setIsGeneratingRecipesModal] =
    useState(false);
  const [isGeneratingViewRecipeModal, setIsGeneratingViewRecipeModal] =
    useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [formData, setFormData] = useState({
    ingredients: "",
    mealType: "",
    cuisine: "",
    cookingTime: "",
    complexity: "",
    people: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleAutocompleteChange = (value) => {
    setFormData({ ...formData, ["cuisine"]: value });
  };
  useEffect(() => {
    if (fiveRecipeText.length > 0) {
      // Trigger the fade-in effect after data is populated
      setIsLoading(false);
      setTimeout(() => {
        setIsVisible(true);
      }, 50); // Slight delay to trigger the transition
    }
  }, [fiveRecipeText]);

  const handleSubmit = (recipe_name) => {
    const updatedFormData = {
      ...formData,
      recipe_name: recipe_name, // Add recipe_name to the formData object
    };
    if (
      !updatedFormData.ingredients ||
      !updatedFormData.mealType ||
      !updatedFormData.cuisine ||
      !updatedFormData.cookingTime ||
      !updatedFormData.complexity ||
      !updatedFormData.people ||
      !updatedFormData.recipe_name
    ) {
      alert("Please fill in all required fields");
      return;
    }
    setRecipeName(recipe_name);
    setIsGeneratingViewRecipeModal(true);
    onSubmit(updatedFormData);
  };
  const handleFiveSubmit = () => {
    if (
      !formData.ingredients ||
      !formData.mealType ||
      !formData.cuisine ||
      !formData.cookingTime ||
      !formData.complexity ||
      !formData.people
    ) {
      alert("Please fill in all required fields");
      return;
    }
    setIsVisible(false);
    setIsLoading(true);
    setIsGeneratingRecipesModal(true);
    onFiveSubmit(formData);
  };

  return (
    <div className="flex justify-between gap-10">
      {isGeneratingRecipesModal && (
        <GeneratingRecipes onClose={() => setIsGeneratingRecipesModal(false)} />
      )}
      <div className="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-lg md:mt-10 w-[45rem]">
        <h2 className="flex justify-center text-2xl font-semibold text-gray-800 mb-4">
          FoodDamns
        </h2>
        <div className="space-y-4">
          {[
            {
              label: "Ingredients",
              id: "ingredients",
              type: "text",
              placeholder: "e.g., chicken, rice",
            },
            {
              label: "Meal Type",
              id: "mealType",
              type: "select",
              options: ["Breakfast", "Lunch", "Dinner", "Snack"],
            },
            {
              label: "Cuisine",
              id: "cuisine",
              type: "autocomplete", // Custom type for the Autocomplete component
            },
            {
              label: "Cooking Time",
              id: "cookingTime",
              type: "select",
              options: ["< 30 mins", "30-60 mins", "> 1 hour"],
            },
            {
              label: "Complexity",
              id: "complexity",
              type: "select",
              options: ["Beginner", "Intermediate", "Advanced"],
            },
            {
              label: "Number of People",
              id: "people",
              type: "number",
              placeholder: "e.g., 4",
            },
          ].map(({ label, id, type, options, placeholder }) => (
            <div key={id}>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor={id}
              >
                {label}
              </label>
              {type === "select" ? (
                <select
                  id={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">Select {label.toLowerCase()}</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : type === "autocomplete" ? (
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4 focus:outline-none">
                  <Autocomplete
                    className="max-w-full focus:outline-red-400 border border-gray-300 px-1 py-[2px] ring-0 outline-none rounded-lg"
                    placeholder="Select a cuisine"
                    aria-label="da"
                    inputValue={formData[id]}
                    onInputChange={handleAutocompleteChange} // Use the custom handler
                  >
                    {cuisines.map((cuisine) => (
                      <AutocompleteItem
                        className="bg-white outline-none px-4 focus:outline-red-400 border-none focus:ring-0"
                        key={cuisine.key}
                      >
                        {cuisine.label}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>
              ) : (
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  value={formData[id]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-10 justify-center">
          <button
            onClick={() => {
              handleFiveSubmit();
            }}
            className="mt-6 w-1/2 bg-blue-500 hover:bg-blue-500/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Generate Recipes
          </button>
          <button
            disabled={!canView}
            onClick={viewRecipe}
            className="mt-6 w-1/2 disabled:bg-gray-400 bg-green-500 hover:bg-green-500/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            View Recipe
          </button>
        </div>
      </div>
      {/* --------------- */}
      <div className="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-lg md:mt-10 w-[30rem]">
        {isGeneratingViewRecipeModal && (
          <GeneratingViewRecipe
            onClose={() => setIsGeneratingViewRecipeModal(false)}
            recipeName={recipeName}
          />
        )}
        <h2 className="flex justify-center text-2xl font-semibold text-gray-800 mb-4">
          Recipes
        </h2>
        <div className="space-y-5">
          {Array.isArray(fiveRecipeText) &&
          fiveRecipeText[0].recipe_name !== "Unknown" ? (
            fiveRecipeText.map((data, index) => (
              <div
                key={index}
                className={`w-full px-4 py-3 h-[6rem] border-[1px] border-green-500 rounded-lg bg-white transition-opacity duration-300 flex justify-between items-center ${
                  isLoading
                    ? "opacity-0"
                    : isVisible
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                <div>
                  <h1
                    className="text-xl pr-2 w-[20rem] font-semibold whitespace-nowrap text-green-600
              overflow-hidden text-ellipsis hover:overflow-visible hover:whitespace-normal hover:bg-white hover:z-10"
                  >
                    {data.recipe_name || "No recipe name available"}
                  </h1>
                  <p className="text-gray-600 mt-1">{data.description}</p>
                </div>
                <button
                  type="button"
                  disabled={recipeName === data.recipe_name}
                  onClick={() => handleSubmit(data.recipe_name)}
                  className="px-3 disabled:bg-gray-400 disabled:pointer-events-none py-1 text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300"
                >
                  Prep
                </button>
              </div>
            ))
          ) : (
            <p>
              {Array.isArray(fiveRecipeText) &&
              fiveRecipeText.length > 0 &&
              fiveRecipeText[0].recipe_name === "Unknown"
                ? "No recipes found"
                : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Hero = ({
  onRecipeSubmit,
  fiveRecipeText,
  onFiveRecipeSubmit,
  viewRecipe,
  canView,
  cuisines,
}) => {
  return (
    <section>
      {/* Container */}
      {/* <div className="mx-auto sm:w-full md:w-2/5 max-w-7xl px-5 py-6 md:px-0 md:py-10 lg:py-10"> */}
      <div className="flex justify-center">
        <div>
          <RecipeCard
            fiveRecipeText={fiveRecipeText}
            onSubmit={onRecipeSubmit}
            onFiveSubmit={onFiveRecipeSubmit}
            viewRecipe={viewRecipe}
            canView={canView}
            cuisines={cuisines}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
