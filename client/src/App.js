import React, { useState, useRef, useEffect } from "react";
import RecipeDisplay from "./components/RecipeDisplay";
import Hero from "./components/Hero";
import RecipeGenerated from "./components/recipeGenerated";
import axios from "axios";

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeDataServer, setRecipeDataServer] = useState(null);
  const [fiveRecipeData, setFiveRecipeData] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [recipeText, setRecipeText] = useState("");
  const [fiveRecipeText, setFiveRecipeText] = useState("");
  const [canViewRecipe, setCanViewRecipe] = useState(false);
  const [error, setError] = useState(null);
  const [isRecipeGeneratedOpen, setIsRecipeGeneratedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const viewRecipeRef = useRef(null);
  const fiveRecipeRef = useRef(null);
  const recipeDisplayRef = useRef(null); // Reference to RecipeDisplay

  useEffect(() => () => closeViewRecipeStream(), []);
  useEffect(() => () => closeFiveRecipeStream(), []);
  useEffect(() => () => fetchCuisines(), []);
  // useEffect(() => () => fiveRecipesStream(), []);

  useEffect(() => {
    if (recipeData) {
      closeViewRecipeStream();
      viewRecipeStream();
    }
  }, [recipeData]);
  useEffect(() => {
    if (fiveRecipeData) {
      closeFiveRecipeStream();
      fiveRecipesStream();
    }
  }, [fiveRecipeData]);

  useEffect(() => {
    if (recipeText.length > 0) {
      setIsRecipeGeneratedOpen(true);
      setCanViewRecipe(true);
      console.log("set to true");
    }
  }, [recipeText]);
  useEffect(() => {
    console.log("Updated Recipe Data:", recipeDataServer);
  }, [recipeDataServer]);

  // const viewRecipeStream = () => {
  //   const queryParams = new URLSearchParams(recipeData).toString();
  //   // const viewRecipe = `https://fooddamns.onrender.com/viewRecipe?${queryParams}`;
  //   const viewRecipe = `http://localhost:4000/viewRecipe?${queryParams}`;
  //   viewRecipeRef.current = new EventSource(viewRecipe);

  //   viewRecipeRef.current.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     // const recipeArray = data.message.split('_____').map(recipe => recipe.trim());
  //     setRecipeText(data.message);
  //   };

  //   viewRecipeRef.current.onerror = (error) => {
  //     console.error("Error:", error);
  //     setError("Connection issue.");
  //     closeViewRecipeStream();
  //   };
  // };

  // const fiveRecipesStream = () => {
  //   const queryParams = new URLSearchParams(fiveRecipeData).toString();
  //   // const viewFiveRecipes = `https://fooddamns.onrender.com/fiveRecipes?${queryParams}`;
  //   const viewFiveRecipes = `http://localhost:4000/fiveRecipes?${queryParams}`;
  //   fiveRecipeRef.current = new EventSource(viewFiveRecipes);

  //   fiveRecipeRef.current.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     const recipesArrayOfObjects = data.message
  //       .split("_____") // Split the data by '_____'
  //       .filter((recipe) => recipe.trim() !== "") // Remove any empty strings
  //       .map((recipe) => {
  //         const nameMatch = recipe.match(/Recipe Name:\s*(.+)/); // Extract the recipe name
  //         const descriptionMatch = recipe.match(/Description:\s*(.+)/); // Extract the description

  //         return {
  //           recipe_name: nameMatch ? nameMatch[1].trim() : "Unknown", // Use 'Unknown' if no match
  //           description: descriptionMatch
  //             ? descriptionMatch[1].trim()
  //             : "No description",
  //         };
  //       });
  //     console.log("hi",recipesArrayOfObjects)
  //     setFiveRecipeText(recipesArrayOfObjects);
  //   };

  //   fiveRecipeRef.current.onerror = (error) => {
  //     console.error('Error:', error);
  //     setError('Connection issue.');
  //     closeFiveRecipeStream();
  //   };
  // };

  const viewRecipeStream = async () => {
    const recipe_name = recipeData.recipe_name; // Assuming recipeData is already defined
    const baseUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

    try {
      // Fetch recipe details
      const response = await fetch(`${baseUrl}${recipe_name}`);

      // Check if the response is OK (status 200)
      if (response.ok) {
        const data = await response.json();

        // Log the response data for debugging
        const source = data.meals[0].strSource;
        const youtube = data.meals[0].strYoutube;
        const ingredients = Object.keys(data.meals[0]) // Access the meals array
          .filter(
            (key) => key.startsWith("strIngredient") && data.meals[0][key]
          ) // Filter non-null, non-empty ingredients
          .map((key) => data.meals[0][key]); // Map to the ingredient values
        const ingredientsString = ingredients.join(", ");

        const recipeDataSerialized = JSON.stringify(recipeData);

        // Create query parameters
        const queryParams = new URLSearchParams({
          recipeData: recipeDataSerialized, // Serialize the recipeData object
          ingredientsString: ingredientsString, // ingredientsString remains a string
          source: source, // ingredientsString remains a string
          youtube: youtube, // ingredientsString remains a string
        }).toString();
        // const viewRecipe = `http://localhost:4000/viewRecipe?${queryParams}`;
        const viewRecipe = `https://fooddamns.onrender.com/viewRecipe?${queryParams}`;

        viewRecipeRef.current = new EventSource(viewRecipe);

        viewRecipeRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setRecipeText(data.message);
        };

        viewRecipeRef.current.onerror = (error) => {
          console.error("Error:", error);
          setError("Connection issue.");
          closeViewRecipeStream();
        };

        // return data;
      } else {
        console.error("No results found for:", recipe_name);
        return null; // No results found
      }
    } catch (error) {
      // Log any errors during the fetch process
      console.error("Error fetching recipe details:", error);
      return null; // Return null if there's an error
    }
  };
  async function updateCommonRecipesWithArea(commonRecipes) {
  // Array to store updated recipes
  const updatedRecipes = [];

  // Loop through each recipe in commonRecipes
  for (let recipe of commonRecipes) {
    try {
      // Fetch the recipe details using the recipe name
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${recipe.recipe_name}`);
      const data = await response.json();

      // Check if data.meals exists and has results
      if (data.meals && data.meals.length > 0) {
        const recipeDetails = data.meals[0]; // Get the first result

        // Add the strArea to the recipe object
        recipe.strArea = recipeDetails.strArea || "Unknown"; // Set to "Unknown" if strArea is missing
      } else {
        // If no data is found, you can set strArea to "Unknown" or keep it undefined
        recipe.strArea = "Unknown";
      }

      // Push the updated recipe to the updatedRecipes array
      updatedRecipes.push(recipe);

    } catch (error) {
      console.error(`Error fetching data for ${recipe.recipe_name}:`, error);
      // In case of error, set strArea to "Unknown"
      recipe.strArea = "Unknown";
      updatedRecipes.push(recipe);
    }
  }

  // Now `updatedRecipes` will contain the recipes with the `strArea` added
  return updatedRecipes;
}

  const fiveRecipesStream = async () => {
    const ingredients = fiveRecipeData.ingredients
      .split(",")
      .map((ingredient) => ingredient.trim()); // Split and trim user input
    const baseUrl = "https://www.themealdb.com/api/json/v1/1/filter.php?i=";
    const results = [];

    try {
      // Fetch recipes for each ingredient
      for (const ingredient of ingredients) {
        const response = await fetch(`${baseUrl}${ingredient}`);
        if (response.ok) {
          const data = await response.json();
          if (data.meals) {
            results.push(
              data.meals.map((meal) => ({
                recipe_name: meal.strMeal,
                description: "no description", // Add "no description" as placeholder
              }))
            );
          } else {
            results.push([]); // No recipes for this ingredient
          }
        } else {
          console.error(`Error fetching recipes for ingredient: ${ingredient}`);
        }
      }

      // Find common recipes by recipe_name
      const commonRecipes = results.reduce((common, current) =>
        common.filter((recipe) =>
          current.some((r) => r.recipe_name === recipe.recipe_name)
        )
      );
      const updatedCommonRecipes = await updateCommonRecipesWithArea(commonRecipes);

      const filteredRecipes = updatedCommonRecipes.filter(
        (recipe) => recipe.strArea === fiveRecipeData.cuisine // Compare strArea with recipeData.cuisine (e.g., "Thai")
      );

      // Return up to 5 recipes
      const recipes = filteredRecipes.slice(0, 5);
      const recipesCount = filteredRecipes.length;
      // setFiveRecipeText(recipes);
      const recipeNames = recipes.map((recipe) => recipe.recipe_name).join(",");
      console.log('filtered:', recipeNames);
      console.log('count:', recipesCount);
      const queryParams = new URLSearchParams({
        recipes: recipeNames,
        count: recipesCount,
      }).toString(); // Properly encode query parameters
      // const viewFiveRecipes = `http://localhost:4000/getDescription?${queryParams}`;
      const viewFiveRecipes = `https://fooddamns.onrender.com/getDescription?${queryParams}`;
      // Use EventSource for SSE
      const description = new EventSource(viewFiveRecipes);
      // Listen for messages from the server
      description.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data); // Parse the streamed JSON data
          console.log("Received data:", data); // Log the entire response to see its structure

          // Split the response by '_____' separator
          const recipesArrayOfObjects = data.message
            .split("_____") // Split the data by '_____'
            .filter((recipe) => recipe.trim() !== "") // Remove any empty strings
            .map((recipe) => {
              const nameMatch = recipe.match(/Recipe Name:\s*(.+)/); // Extract the recipe name
              const descriptionMatch = recipe.match(/Description:\s*(.+)/); // Extract the description

              return {
                recipe_name: nameMatch ? nameMatch[1].trim() : "Unknown", // Use 'Unknown' if no match
                description: descriptionMatch
                  ? descriptionMatch[1].trim()
                  : "No description",
              };
            });
          setFiveRecipeText(recipesArrayOfObjects);
          console.log("recipe array", recipesArrayOfObjects)
          console.log("Updated Recipes with Descriptions:", recipes); // Updated recipes with descriptions
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      // Handle errors from EventSource
      description.onerror = (error) => {
        console.error("Error with EventSource:", error);
        description.close(); // Close the connection if there's an error
      };
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  const closeViewRecipeStream = () => {
    if (viewRecipeRef.current) viewRecipeRef.current.close();
  };
  const closeFiveRecipeStream = () => {
    if (fiveRecipeRef.current) fiveRecipeRef.current.close();
  };

  const viewRecipe = () => {
    setIsOpen(true);
  };

  const handleRecipeSubmit = (data) => {
    setRecipeData(data);
    setRecipeText(""); // Clear previous recipe text
    setError(null); // Clear previous error
  };

  const handleFiveRecipeSubmit = (data) => {
    setFiveRecipeData(data);
    setFiveRecipeText(""); // Clear previous recipe text
    setError(null); // Clear previous error
    if (fiveRecipeData) {
      closeFiveRecipeStream();
      fiveRecipesStream();
    }
  };

  // const url = "https://rest.gadventures.com/nationalities/";
  // const apiKey = "test_310c859286a3646718ff72fbf408822f63296c7b";
  // const apiKey = "live_cd972c4169238a2a662938f062453b9f100118b2";
  async function fetchCuisines() {
    const url = "https://rest.gadventures.com/nationalities/";
    const apiKey = "live_42777ad5e44225d3b731e7e3428d4c8a7b781887";
    const maxPages = 5; // We want to fetch 3 pages
    let allCuisines = [];

    try {
      for (let page = 1; page <= maxPages; page++) {
        const response = await fetch(`${url}?page=${page}`, {
          method: "GET",
          headers: {
            "X-Application-Key": apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const cuisines = data.results.map((item) => ({
            id: item.id,
            label: item.name,
            key: item.name.toLowerCase().replace(/\s+/g, "-"),
          }));

          // Append results to the overall list
          allCuisines = [...allCuisines, ...cuisines];

          // console.log(`Fetched page ${page}:`, cuisines);

          // Stop if there are no more pages
          if (!data.links.some((link) => link.rel === "next")) {
            break;
          }
        } else {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          break; // Exit the loop if an error occurs
        }
      }

      // Save the accumulated cuisines
      setCuisines(allCuisines);
      console.log("All cuisines:", allCuisines);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
  return (
    <div className="bg-gray-100/80 min-h-screen font-sans">
      {isRecipeGeneratedOpen && (
        <RecipeGenerated onClose={() => setIsRecipeGeneratedOpen(false)} />
      )}
      <Hero
        cuisines={cuisines}
        fiveRecipeText={fiveRecipeText}
        onRecipeSubmit={handleRecipeSubmit}
        onFiveRecipeSubmit={handleFiveRecipeSubmit}
        viewRecipe={viewRecipe}
        canView={canViewRecipe}
      />

      <div ref={recipeDisplayRef}>
        {" "}
        {/* Add reference here */}
        <RecipeDisplay
          error={error}
          recipeText={recipeText}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
    </div>
  );
}

export default App;
