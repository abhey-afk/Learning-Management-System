import React, { useState } from "react";

const categories = [
  { id: "nextjs", label: "Next JS" },
  { id: "data science", label: "Data Science" },
  { id: "frontend development", label: "Frontend Development" },
  { id: "fullstack development", label: "Fullstack Development" },
  { id: "mern stack development", label: "MERN Stack Development" },
  { id: "backend development", label: "Backend Development" },
  { id: "javascript", label: "Javascript" },
  { id: "python", label: "Python" },
  { id: "docker", label: "Docker" },
  { id: "mongodb", label: "MongoDB" },
  { id: "html", label: "HTML" },
];

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full md:w-[20%]">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">Filter Options</h1>
        
        {/* Custom Select Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center justify-between w-36 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{sortByPrice === "low" ? "Low to High" : sortByPrice === "high" ? "High to Low" : "Sort by"}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <div className="px-3 py-1 text-xs font-medium text-gray-500">Sort by price</div>
                <button 
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${sortByPrice === "low" ? "bg-gray-50 font-medium" : ""}`}
                  onClick={() => selectByPriceHandler("low")}
                >
                  Low to High
                </button>
                <button 
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${sortByPrice === "high" ? "bg-gray-50 font-medium" : ""}`}
                  onClick={() => selectByPriceHandler("high")}
                >
                  High to Low
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Separator */}
      <div className="h-px bg-gray-200 my-4"></div>
      
      <div>
        <h1 className="font-semibold mb-2">CATEGORY</h1>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2 my-2">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <label 
                htmlFor={category.id} 
                className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                {category.label}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;