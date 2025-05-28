import React, { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle, Play, Search, Filter } from "lucide-react";
import { useGetPurchasedCoursesQuery, useGetPendingPurchasesQuery } from "../../features/api/purchaseApi";
import { useLoadUserQuery } from "../../features/api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Course Card
const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const difficultyColorMap = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-blue-100 text-blue-800",
    Advanced: "bg-purple-100 text-purple-800",
  };

  // Map courseDifficulty from API to display format
  const mapDifficulty = (level) => {
    const map = {
      "easy": "Beginner",
      "medium": "Intermediate",
      "hard": "Advanced"
    };
    return map[level?.toLowerCase()] || level || "Beginner";
  };

  // Get values directly from the enhanced course object
  const progress = course.progress || 0;
  const difficulty = mapDifficulty(course.courseId?.courseLevel);
  const completedLectures = course.completedLectures || 0;
  const totalLectures = course.courseId?.lectures?.length || 0;
  const isCompleted = course.completed || progress === 100;
  const isPending = course.isPending || course.status === "pending";

  const handleContinueLearning = () => {
    if (isPending) {
      // For pending purchases, don't navigate, show message
      toast.info("Your payment is still processing. You'll have access to this course once payment is confirmed.");
      return;
    }
    
    if (course.courseId?._id) {
      navigate(`/courses-progress/${course.courseId._id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="relative">
        <img 
          src={course.courseId?.courseThumbnail || "https://placehold.co/400x300/4287f5/FFFFFF?text=Course"} 
          alt={course.courseId?.courseTitle} 
          className="w-full h-40 object-cover" 
        />
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Completed
          </div>
        )}
        {isPending && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <span className="mr-1">Payment Processing</span>
            <div className="animate-pulse h-2 w-2 bg-white rounded-full"></div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <span className={`text-xs font-medium px-2 py-1 rounded ${difficultyColorMap[difficulty]}`}>
            {difficulty}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{course.courseId?.courseTitle}</h3>
        <p className="text-gray-600 text-sm mb-1">
          {course.courseId?.creator?.name ? `Instructor: ${course.courseId.creator.name}` : 
          course.courseId?.creator?.firstName ? `Instructor: ${course.courseId.creator.firstName} ${course.courseId.creator.lastName || ''}` : ''}
        </p>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.courseId?.description || course.courseId?.subTitle}</p>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{isPending ? "Pending" : `${progress}%`}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${isPending ? "bg-yellow-500" : "bg-blue-600"}`}
              style={{ width: isPending ? "100%" : `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 mb-4">
          {isPending ? (
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-yellow-500" />
              <span>Payment processing</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <CheckCircle size={14} className={completedLectures > 0 ? "text-green-500" : "text-gray-400"} />
              <span>{completedLectures}/{totalLectures} completed</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-blue-500" />
            <span>{isPending ? "Awaiting payment" : isCompleted ? "Review Course" : "Continue learning"}</span>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={handleContinueLearning}
            className={`w-full ${
              isPending 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : isCompleted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium py-2 rounded-md flex items-center justify-center transition`}
          >
            <Play size={16} className="mr-2" />
            {isPending ? "Payment Processing" : isCompleted ? "Review Course" : "Continue Learning"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function MyLearning() {
  const { data: userData } = useLoadUserQuery();
  const { data: purchasedCourses, isLoading, error } = useGetPurchasedCoursesQuery();
  const { data: pendingData } = useGetPendingPurchasesQuery();
  
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("inProgress");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const difficultyOptions = ["All", "Beginner", "Intermediate", "Advanced"];

  // Combine regular purchases with any pending purchases
  const allPurchases = React.useMemo(() => {
    const purchased = purchasedCourses?.purchasedCourse || [];
    const pending = pendingData?.pendingPurchases || [];
    
    // Create a merged list, marking pending items appropriately
    return [
      ...purchased,
      ...pending.map(item => ({
        ...item,
        isPending: true,
        progress: 0,
        completedLectures: 0
      }))
    ];
  }, [purchasedCourses, pendingData]);

  // Process and filter courses whenever data changes
  useEffect(() => {
    if (allPurchases) {
      console.log("All purchases:", allPurchases);
      
      let coursesToDisplay = allPurchases;
      
      // Apply search filter
      if (searchQuery) {
        coursesToDisplay = coursesToDisplay.filter(
          (course) =>
            course.courseId?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.courseId?.subTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.courseId?.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply difficulty filter (map API difficulty levels to display levels)
      if (selectedDifficulty !== "All") {
        const difficultyMap = {
          "Beginner": ["easy", "beginner"],
          "Intermediate": ["medium", "intermediate"],
          "Advanced": ["hard", "advanced"]
        };
        
        coursesToDisplay = coursesToDisplay.filter(
          (course) => 
            difficultyMap[selectedDifficulty]?.includes(
              course.courseId?.courseLevel?.toLowerCase()
            )
        );
      }

      // Apply tab filter (in progress vs completed)
      // Note: This depends on your API's progress tracking
      if (activeTab === "inProgress") {
        coursesToDisplay = coursesToDisplay.filter(
          (course) => !course.isPending && (course.progress || 0) < 100
        );
      } else if (activeTab === "completed") {
        coursesToDisplay = coursesToDisplay.filter(
          (course) => !course.isPending && (course.progress || 0) === 100
        );
      } else if (activeTab === "pending") {
        coursesToDisplay = coursesToDisplay.filter(
          (course) => course.isPending
        );
      }

      setFilteredCourses(coursesToDisplay);
    }
  }, [allPurchases, searchQuery, selectedDifficulty, activeTab]);

  const SkeletonCard = () => (
    <div className="flex flex-col bg-white shadow rounded-lg p-5 animate-pulse">
      <div className="w-full h-40 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
      <div className="h-2 bg-gray-200 rounded-full mb-2 w-full"></div>
      <div className="flex justify-between items-center w-full mb-4">
        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-300 rounded-md w-full"></div>
    </div>
  );

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Courses</h2>
          <p className="text-gray-700 mb-4">
            {error.data?.message || error.error || "Something went wrong. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Learning</h1>
          <p className="text-gray-600">Continue your learning journey with your enrolled courses</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your courses..."
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto gap-2 pb-1">
            {difficultyOptions.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  selectedDifficulty === difficulty
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-4 font-medium text-sm border-b-2 ${
              activeTab === "inProgress"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("inProgress")}
          >
            In Progress
          </button>
          <button
            className={`py-3 px-4 font-medium text-sm border-b-2 ${
              activeTab === "completed"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          {pendingData?.pendingPurchases?.length > 0 && (
            <button
              className={`py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === "pending"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Payment Processing
              <span className="ml-1 bg-yellow-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                {pendingData.pendingPurchases.length}
              </span>
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(6).fill().map((_, idx) => <SkeletonCard key={idx} />)
            : filteredCourses.length > 0
            ? filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))
            : <p className="text-gray-600 col-span-full text-center py-10">No courses found. Start learning by enrolling in a course!</p>}
        </div>
      </div>
    </div>
  );
}