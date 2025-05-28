import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Search } from "lucide-react";
import { useGetSearchCourseQuery } from "../../features/api/courseApi";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const { data, isLoading, error, isError } = useGetSearchCourseQuery({
    searchQuery: query,
    categories: selectedCategories,
    sortByPrice
  });

  // Debug logs
  useEffect(() => {
    console.log("Search query:", query);
    console.log("Selected categories:", selectedCategories);
    console.log("Sort by price:", sortByPrice);
    console.log("API response data:", data);
    if (error) console.error("API error:", error);
  }, [query, selectedCategories, sortByPrice, data, error]);

  const isEmpty = !isLoading && (!data?.courses || data?.courses?.length === 0);

  const handleFilterChange = (categories, price) => {
    setSelectedCategories(categories);
    setSortByPrice(price);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="my-6">
        <h1 className="font-bold text-xl md:text-2xl">Results for "{query}"</h1>
        <p>
          Showing results for{" "}
          <span className="text-blue-800 font-bold italic">{query}</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <Filter handleFilterChange={handleFilterChange} />
        <div className="flex-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <CourseSkeleton key={idx} />
            ))
          ) : isError ? (
            <div className="flex flex-col items-center justify-center min-h-32 p-6">
              <AlertCircle className="text-red-500 h-16 w-16 mb-4" />
              <h1 className="font-bold text-2xl text-gray-800 mb-2">
                Error Loading Courses
              </h1>
              <p className="text-gray-600 mb-4">
                An error occurred while searching for courses.
              </p>
            </div>
          ) : isEmpty ? (
            <CourseNotFound />
          ) : (
            data?.courses?.map((course) => <SearchResult key={course._id} course={course} />)
          )}
        </div>
      </div>
    </div>
  );
};

const Filter = ({ handleFilterChange }) => {
  const categories = ["Web Development", "Mobile Development", "Data Science", "Design", "Marketing"];
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceSort, setPriceSort] = useState("");

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category];
      
      handleFilterChange(newCategories, priceSort);
      return newCategories;
    });
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPriceSort(value);
    handleFilterChange(selectedCategories, value);
  };

  return (
    <div className="w-full md:w-64 bg-white p-4 rounded-lg border border-gray-200 h-fit">
      <h2 className="text-lg font-semibold mb-4">Filter Courses</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <input
                type="checkbox"
                id={category}
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor={category} className="text-sm">{category}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Price</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="low-to-high"
              name="price"
              value="asc"
              checked={priceSort === "asc"}
              onChange={handlePriceChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="low-to-high" className="text-sm">Low to High</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="high-to-low"
              name="price"
              value="desc"
              checked={priceSort === "desc"}
              onChange={handlePriceChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="high-to-low" className="text-sm">High to Low</label>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchResult = ({ course }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between border-b border-gray-300 py-4">
      <div className="h-32 w-full md:w-64 mb-4 md:mb-0">
        <img 
          src={course.courseThumbnail || "https://placehold.co/600x400?text=No+Image"} 
          alt={course.courseTitle} 
          className="h-full w-full object-cover rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-2 flex-1 px-4">
        <h2 className="text-lg font-semibold">{course.courseTitle}</h2>
        <p className="text-sm text-gray-600">{course.subTitle || "No description available"}</p>
        <div className="flex items-center gap-2 text-sm">
          <span>By {course.creator ? `${course.creator.firstName || ''} ${course.creator.lastName || ''}` : 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {course.courseLevel || "Beginner"}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {course.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between mt-4 md:mt-0">
        <p className="font-bold text-lg">₹{course.coursePrice || 0}</p>
        <Link to={`/courses-detail/${course._id}`} className="mt-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
            View Course
          </button>
        </Link>
      </div>
    </div>
  );
};

const CourseNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-32 p-6">
      <AlertCircle className="text-red-500 h-16 w-16 mb-4" />
      <h1 className="font-bold text-2xl md:text-4xl text-gray-800 mb-2">
        Course Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        Sorry, we couldn't find the course you're looking for.
      </p>
      <Link to="/" className="italic">
        <button className="text-blue-600 underline">Browse All Courses</button>
      </Link>
    </div>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between border-b border-gray-300 py-4">
      <div className="h-32 w-full md:w-64 bg-gray-200 animate-pulse rounded-lg"></div>

      <div className="flex flex-col gap-2 flex-1 px-4">
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-6 w-20 mt-2 bg-gray-200 animate-pulse rounded"></div>
      </div>

      <div className="flex flex-col items-end justify-between mt-4 md:mt-0">
        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
  );
};

export default SearchPage;
