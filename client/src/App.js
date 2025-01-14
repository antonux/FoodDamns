import React, { useState, useRef, useEffect } from "react";
import RecipeDisplay from "./components/RecipeDisplay";
import Hero from "./components/Hero";
import RecipeGenerated from "./components/recipeGenerated";

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [fiveRecipeData, setFiveRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState('');
  const [fiveRecipeText, setFiveRecipeText] = useState('');
  const [canViewRecipe, setCanViewRecipe] = useState(false);
  const [error, setError] = useState(null);
  const [isRecipeGeneratedOpen, setIsRecipeGeneratedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const viewRecipeRef = useRef(null);
  const fiveRecipeRef = useRef(null);
  const recipeDisplayRef = useRef(null); // Reference to RecipeDisplay

  useEffect(() => () => closeViewRecipeStream(), []); 
  useEffect(() => () => closeFiveRecipeStream(), []); 

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
    setCanViewRecipe(true)
    console.log('set to true')
    }
  }, [recipeText]);

  const viewRecipeStream = () => {
    const queryParams = new URLSearchParams(recipeData).toString();
    // const url = `https://fooddamns.onrender.com/recipeStream?${queryParams}`;
    const viewRecipe = `https://fooddamns.onrender.com/viewRecipe?${queryParams}`;
    viewRecipeRef.current = new EventSource(viewRecipe);

    viewRecipeRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // const recipeArray = data.message.split('_____').map(recipe => recipe.trim());
      setRecipeText(data.message);
    };

    viewRecipeRef.current.onerror = (error) => {
      console.error('Error:', error);
      setError('Connection issue.');
      closeViewRecipeStream();
    };
  };

  const fiveRecipesStream = () => {
    const queryParams = new URLSearchParams(fiveRecipeData).toString();
    // const url = `https://fooddamns.onrender.com/recipeStream?${queryParams}`;
    const viewFiveRecipes = `https://fooddamns.onrender.com/fiveRecipes?${queryParams}`;
    fiveRecipeRef.current = new EventSource(viewFiveRecipes);

    fiveRecipeRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
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
      console.log("hi",recipesArrayOfObjects)
      setFiveRecipeText(recipesArrayOfObjects);
    };

    fiveRecipeRef.current.onerror = (error) => {
      console.error('Error:', error);
      setError('Connection issue.');
      closeFiveRecipeStream();
    };
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
    setRecipeText(''); // Clear previous recipe text
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

  return (
    <div className="bg-gray-100/80 min-h-screen font-sans">
      {isRecipeGeneratedOpen && (
        <RecipeGenerated onClose={() => setIsRecipeGeneratedOpen(false)} />
      )}
      <Hero fiveRecipeText={fiveRecipeText} onRecipeSubmit={handleRecipeSubmit} onFiveRecipeSubmit={handleFiveRecipeSubmit} viewRecipe={viewRecipe} canView={canViewRecipe} />
          
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
