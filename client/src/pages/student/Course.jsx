import React, { useState, useEffect } from "react";
import { BookOpen, Filter, ChevronDown, Users, User, Clock, Video } from "lucide-react";
import { useGetPublishedCourseQuery } from "../../features/api/courseApi";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="flex flex-col bg-white shadow rounded-2xl p-5 animate-pulse">
    <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
    <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
    <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
    <div className="flex justify-between items-center w-full">
      <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const DifficultyBadge = ({ level }) => {
  const levelMap = {
    Beginner: "Beginner",
    Medium: "Intermediate",
    Advance: "Advanced",
  };

  const colorMap = {
    Beginner: "bg-green-100 text-green-800",
    Medium: "bg-blue-100 text-blue-800",
    Advanced: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorMap[level]}`}>
      {levelMap[level] || level}
    </span>
  );
};

const Courses = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: coursesData, isLoading, isError } = useGetPublishedCourseQuery();
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (coursesData?.courses) {
      let results = coursesData.courses;

      if (selectedDifficulty !== "All") {
        results = results.filter(
          (course) =>
            course.courseLevel === selectedDifficulty ||
            (selectedDifficulty === "Intermediate" && course.courseLevel === "Medium")
        );
      }

      setFilteredCourses(results);
    }
  }, [selectedDifficulty, coursesData]);

  const difficultyOptions = ["All", "Beginner", "Intermediate", "Advanced"];

  if (isError)
    return (
      <div className="text-center py-10">
        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Error loading courses</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );

  return (
    <section className="py-16 bg-gray-50 px-4 md:px-10">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 text-blue-700">Explore Our Courses</h2>
        <p className="text-gray-600 text-lg">
          Find the course that suits your passion, skill level, and career goals.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg md:hidden justify-center"
            >
              <Filter className="h-5 w-5" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`${filtersOpen ? "flex" : "hidden"} md:flex flex-wrap gap-2`}>
              {difficultyOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${selectedDifficulty === level
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!isLoading && filteredCourses?.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your filters to find what you're looking for</p>
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array(4)
            .fill()
            .map((_, idx) => <SkeletonCard key={idx} />)
          : filteredCourses?.map((course) => (
            <div
              key={course._id}
              className="flex flex-col bg-white shadow-lg rounded-2xl overflow-hidden transition-transform hover:scale-105 hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={course.courseThumbnail}
                  alt={course.courseTitle}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  <span>{course.lectures?.length || 0}</span>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{course.courseTitle}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2 font-medium">{course.subTitle}</p>

                <div
                  className="prose prose-sm max-w-none text-gray-600 mb-4"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {course.creator?.photoUrl ? (
                      <img
                        src={course.creator.photoUrl}
                        alt="Instructor"
                        className="w-6 h-6 rounded-full inline-block mr-2"
                      />
                    ) : null}
                    {course.creator?.name || "Unknown Instructor"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(course.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-green-600">₹{course.coursePrice}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents?.length || 0}</span>
                    </div>
                  </div>
                  <DifficultyBadge level={course.courseLevel} />
                </div>
                <Link
                  to={`/courses-detail/${course._id}`}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full text-center"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default Courses;
