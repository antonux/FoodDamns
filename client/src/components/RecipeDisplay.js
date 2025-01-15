import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

const RecipeDisplay = ({ error, recipeText, isOpen, setIsOpen }) => {
  const [isVisible, setIsVisible] = useState(false);

  const formatText = (text) => {
  // Convert bold text surrounded by '**' to <strong> tags
  const boldText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert URLs into clickable links with color and hover effect
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const textWithLinks = boldText.replace(linkRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1E90FF; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${url}</a>`;
  });

  return textWithLinks;
};
  const generatePDF = () => {
    const doc = new jsPDF();
    const recipeContent = recipeText.replace(/\*\*(.*?)\*\*/g, "$1");

    // Set up PDF content
    doc.setFontSize(16);
    doc.text("Generated Recipe", 10, 10);

    // Split the content into lines and add to PDF
    const lines = doc.splitTextToSize(recipeContent, 180);
    doc.setFontSize(12);
    doc.text(lines, 10, 20);

    // Save the PDF
    doc.save("Recipe.pdf");
  };

  const closeModal = () => {
    setIsVisible(false); // Set visibility to false
    setTimeout(() => setIsOpen(false), 300); // Close modal after animation
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsVisible(true); // Trigger scale-in effect when modal opens
      }, 100); // Add slight delay for effect
    }
  }, [isOpen]);

  return (
    <div>
      {/* Modal */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white p-6 rounded-lg shadow-lg md:w-full pb-[5rem] w-[20rem] h-[90vh] md:max-w-2xl transition-transform duration-300 transform ${
              isVisible ? "scale-100" : "scale-90"
            }`}
          >
            <div className="flex justify-between">
              <h2 className="md:text-2xl font-semibold text-gray-800 pb-7">
                Generated Recipe
              </h2>
              <button
                onClick={generatePDF}
                disabled={!recipeText}
                className="mt-4 bg-blue-500 md:ml-36 mr-10 md:mr-0 translate-y-[-1.2rem] disabled:bg-gray-300 hover:bg-blue-500/90 text-white md:py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Download as PDF
              </button>
              <button
                onClick={closeModal}
                className="text-gray-500 translate-y-[-1.2rem] text-4xl"
              >
                &times;
              </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {recipeText ? (
              <div className="h-full overflow-y-auto bg-gray-50 rounded-lg p-2">
                <p
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: formatText(recipeText) }}
                />
              </div>
            ) : (
              <p>
                Your recipe will be ready shortly. Enjoy cooking!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplay;
