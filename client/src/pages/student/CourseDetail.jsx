import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { BadgeInfo, PlayCircle, AlertCircle } from "lucide-react";
import ReactPlayer from "react-player";
import BuyCourseButton from "../../components/BuyCourseButton";
import { useGetCourseDetailWithStatusQuery } from "../../features/api/purchaseApi";
import { useGetCourseByIdQuery } from "../../features/api/courseApi";
import Cookies from "js-cookie";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Only fetch course details with status if user is logged in
  const shouldFetchWithStatus = isLoggedIn;
  const { data: response, isLoading: isLoadingAuth, isError: isErrorAuth } = useGetCourseDetailWithStatusQuery(courseId, {
    skip: !shouldFetchWithStatus
  });
  
  // Fetch public course details if user is not logged in
  const { data: publicCourseData, isLoading: isLoadingPublic, isError: isErrorPublic } = useGetCourseByIdQuery(courseId, {
    skip: shouldFetchWithStatus
  });
  
  // Determine which course data to use
  const course = isLoggedIn ? response?.course : publicCourseData?.course;
  const isLoading = isLoggedIn ? isLoadingAuth : isLoadingPublic;
  const isError = isLoggedIn ? isErrorAuth : isErrorPublic;
  
  // Check user authentication status and role
  useEffect(() => {
    // Check if user is logged in
    const token = Cookies.get("authToken");
    setIsLoggedIn(!!token);
    
    // Get user info from localStorage if logged in
    if (token) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setUserRole(userInfo.role || null);
      } catch (error) {
        console.error("Error getting user role:", error);
        setUserRole(null);
      }
    } else {
      // User is not logged in
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    // Check if redirected here with access=denied query parameter
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('access') === 'denied') {
      setShowAccessDenied(true);
      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => setShowAccessDenied(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleNavigateToCourse = () => {
    navigate(`/courses-progress/${courseId}`);
  };
  
  const handlePurchaseClick = () => {
    // If user is not logged in, redirect to login page
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    // Otherwise continue with normal purchase flow
  };
  
  // Check if user is an instructor or has purchased the course
  const canAccessCourse = userRole === "instructor" || response?.purchased;

  if (isLoading) return <div className="text-center py-8">Loading course details...</div>;
  if (isError) return <div className="text-center py-8 text-red-500">Error loading course details</div>;
  if (!course) return <div className="text-center py-8">Course not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Access Denied Message */}
      {showAccessDenied && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 sticky top-16 z-40 animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>
              <span className="font-bold">Access Denied:</span> You need to purchase this course to access its content.
            </p>
            <button 
              onClick={() => setShowAccessDenied(false)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Course Header */}
      <div className="bg-gray-900 text-white py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold">{course?.courseTitle}</h1>
          <p className="text-lg text-gray-300">{course?.subTitle}</p>
          <div className="flex items-center gap-2 text-sm">
            <span>Created by</span>
            <span className="text-purple-300 italic">
              {course?.creator?.firstName} {course?.creator?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <BadgeInfo className="w-4 h-4" />
            <span>Last updated {course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : ''}</span>
          </div>
          <p className="text-sm text-gray-400">
            Students enrolled: {course?.enrolledStudents?.length || 0}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Section */}
        <div className="flex-1 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: course?.description || '' }}
            />
          </div>

          {/* Course Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <p className="text-gray-600 mb-4">{course?.lectures?.length || 0} lectures</p>
            <div className="space-y-3">
              {course?.lectures?.map((lecture) => (
                <div 
                  key={lecture._id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <span className="text-blue-600">
                    <PlayCircle size={18} />
                  </span>
                  <span className="text-gray-800">{lecture.lectureTitle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:w-96 space-y-6">
          {/* Video Preview */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="aspect-video rounded-lg overflow-hidden">
              <ReactPlayer
                url={course?.lectures?.[0]?.videoUrl}
                width="100%"
                height="100%"
                controls
              />
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold">Course Price</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{course?.coursePrice}
              </p>
            </div>
            
            {/* Button options based on user status */}
            <div className="mt-6">
              {!isLoggedIn ? (
                // For non-logged in users, show "Purchase Course" button that redirects to login
                <button
                  onClick={() => navigate('/login', { state: { from: location.pathname } })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  Purchase Course
                </button>
              ) : userRole === "instructor" ? (
                // For instructors, show "Go to Course" button
                <button
                  onClick={handleNavigateToCourse}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  Go to Course
                </button>
              ) : (
                // For logged-in students, show the BuyCourseButton
                <BuyCourseButton 
                  courseId={courseId}
                  price={course?.coursePrice}
                  isPurchased={response?.purchased}
                  onSuccess={handleNavigateToCourse}
                />
              )}
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Skill Level</span>
              <span className="font-medium capitalize">{course?.courseLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Category</span>
              <span className="font-medium">{course?.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Language</span>
              <span className="font-medium">English</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;