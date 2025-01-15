// server.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config({ path: "../.env" }); // Adjusted to load from parent directory

const app = express();
const PORT = process.env.PORT;

// Enable CORS for all routes
app.use(cors());

// SSE Endpoint
app.get("/fiveRecipes", (req, res) => {
  const { ingredients, cuisine, cookingTime, complexity, people } = req.query;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send messages
  const sendEvent = (message) => {
    res.write(`data: ${JSON.stringify({ message })}\n\n`);
  };

  // Update the prompt to let the AI consider the note if it exists

  const fiveRecipesPrompt = `give me 5 different food recipes with basing of of this. 
  ingredients(${ingredients}), cuisine(${cuisine}), cookingTime(${cookingTime}), complexity(${complexity}), number of people(${people})
  Generate different recipe names every the same query.
  The recipes should be an existing recipe online with sources. DONT GIVE ME FICTIONAL RECIPES.
  Return me a message with this format strictly:
  ONLY RETURN 5 STRICTLY.

  Recipe Name: (name)
  Description: (recipe description)
  _____

  Recipe Name: (name)
  Description: (recipe description)
  _____

  Recipe Name: (name)
  Description: (recipe description)
  _____

  Recipe Name: (name)
  Description: (recipe description)
  _____
  Recipe Name: (name)
  Description: (recipe description)
  _____

  Note that the description should be brief. maximum of 10 words.
  Be strict on the 5 _____ underscores. And dont remove the labels (Recipe Name) and (Description).

  `;

  fiveRecipesFunc(fiveRecipesPrompt, sendEvent);

  req.on("close", () => res.end());
});

async function fiveRecipesFunc(prompt, callback) {
  const genAI = new GoogleGenerativeAI(process.env.GEN_AI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Generate the content based on the provided messages
    const result = await model.generateContent(prompt);  // Use the user content for recipe

    // Send the result back as a stream
    if (result && result.response && result.response.text) {
      callback(result.response.text());  // Directly pass text
    } else {
      console.error("No valid content returned:", result);
      callback({ action: "error", message: "No valid content received" });
    }
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    callback({ action: "error", message: error.message });
  }
}

app.get("/viewRecipe", (req, res) => {
  const recipeData = JSON.parse(req.query.recipeData);
  const { cuisine, cookingTime, recipe_name, people, complexity } = recipeData;
  const ingredients = req.query.ingredientsString;
  const source = req.query.source;
  const youtube = req.query.youtube;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send messages
  const sendEvent = (message) => {
    res.write(`data: ${JSON.stringify({ message })}\n\n`);
  };

  // Update the prompt to let the AI consider the note if it exists
  const viewRecipePrompt = `
    Generate a recipe called ${recipe_name} in a structured plain text format with a suitable name for the dish based on the given ingredients, cuisine, and other details. The output should be formatted in a visually appealing way, with specific sections in bold as described below. And put this source link at top for reference: ${source} (if the source is null or undefined, just put "Reference Unavailable. Please take this recipe with a grain of salt." But if theres a source, just also add youtube link below: ${youtube}. Dont make this fictional.
    Be sure to keep the recipe name as ${recipe_name}. 

    ---
    **How to Make ${recipe_name} - ${cuisine} Style**

    This recipe is for ${people} servings and takes around ${cookingTime}. Complexity: ${complexity}.

    **Recipe at a Glance:**
    - Cooking Time: ${cookingTime}
    - Complexity: ${complexity}
    - Serves: ${people}
    - Main Ingredients: ${ingredients}

    **Ingredients You’ll Need:**
    - List each ingredient in a clear format, specifying quantities where possible.

    **Step-by-Step Instructions:**
    1. Provide each cooking step in a numbered format.
    2. Include specific steps for cooking the primary ingredient (${ingredients}). NOTE=Use only these ingredients.

    **Nutritional Summary (per serving):**
    - Calories: [calories in kcal]
    - Carbohydrates: [amount in grams]
    - Proteins: [amount in grams]
    - Fats: [amount in grams]

    **Tips for a Perfect Dish:**
    - Include helpful cooking tips, such as optimal flavor combinations or cooking techniques.

    ---
    The response should use bold headings as specified and be in plain text format. Avoid any markdown syntax or code blocks.
    
    At the very top, provide a reference link of the recipe from online. The reference name of the recipe should exactly be ${recipe_name}.
  `;

  viewRecipeFunc(viewRecipePrompt, sendEvent);

  req.on("close", () => res.end());
});



async function viewRecipeFunc(prompt, callback) {
  const genAI = new GoogleGenerativeAI(process.env.GEN_AI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Generate the content based on the provided messages
    const result = await model.generateContent(prompt);  // Use the user content for recipe

    // Send the result back as a stream
    if (result && result.response && result.response.text) {
      callback(result.response.text());  // Directly pass text
    } else {
      console.error("No valid content returned:", result);
      callback({ action: "error", message: "No valid content received" });
    }
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    callback({ action: "error", message: error.message });
  }
}

app.get("/getDescription", (req, res) => {
  const recipes = req.query.recipes;
  const { count } = req.query.count;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send messages
  const sendEvent = (message) => {
    res.write(`data: ${JSON.stringify({ message })}\n\n`);
  };

  // Update the prompt to let the AI consider the note if it exists
  const descriptionPrompt = `
  Generate a short description of the recipe inside here=(${recipes}) max of 5 words only.
  Return me a message with this format.
  BE STRICT WITH THE COUNT:${count}(IF THIS IS UNDEFINED just return "Recipe Name: UNKNOWN"). THATS HOW MANY YOU WILL MAKE.

  

  Recipe Name: (name)
  Description: (recipe description)
  _____

  Recipe Name: (name)
  Description: (recipe description)
  

  Note that the description should be brief. maximum of 5 words.
  Be strict on the 5 _____ underscores. And dont remove the labels (Recipe Name) and (Description).
  `;


  viewRecipeFunc(descriptionPrompt, sendEvent);

  req.on("close", () => res.end());
});



async function viewRecipeFunc(prompt, callback) {
  const genAI = new GoogleGenerativeAI(process.env.GEN_AI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Generate the content based on the provided messages
    const result = await model.generateContent(prompt);  // Use the user content for recipe

    // Send the result back as a stream
    if (result && result.response && result.response.text) {
      callback(result.response.text());  // Directly pass text
    } else {
      console.error("No valid content returned:", result);
      callback({ action: "error", message: "No valid content received" });
    }
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    callback({ action: "error", message: error.message });
  }
}


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
