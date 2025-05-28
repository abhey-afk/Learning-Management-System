import React, { useEffect, useState } from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useGetPurchasedCoursesQuery } from "../features/api/purchaseApi";

/**
 * A component that protects course progress routes
 * Users can only access progress for courses they've purchased
 */
const CourseProgressProtection = ({ children }) => {
  const { courseId } = useParams();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Fetch the user's purchased courses
  const { data: purchaseData, isLoading, error } = useGetPurchasedCoursesQuery();

  useEffect(() => {
    const checkCourseAccess = () => {
      // First check if user is authenticated at all
      const token = Cookies.get("authToken");
      if (!token) {
        console.log("Course access denied: No auth token");
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // If purchase data is not yet loaded, wait
      if (isLoading) {
        return;
      }

      // Check if the user has purchased this course
      if (purchaseData && purchaseData.purchasedCourse) {
        // Check if courseId is in purchased courses
        const hasPurchased = purchaseData.purchasedCourse.some(
          purchase => purchase.courseId?._id === courseId
        );

        if (hasPurchased) {
          setIsAuthorized(true);
        } else {
          console.log(`Course access denied: User has not purchased course ${courseId}`);
          setIsAuthorized(false);
        }
      } else {
        // No purchase data available
        setIsAuthorized(false);
      }

      setIsChecking(false);
    };

    checkCourseAccess();
  }, [courseId, purchaseData, isLoading, error]);

  if (isLoading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Checking course access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error Checking Access</h2>
          <p className="text-gray-600 mb-4">
            There was a problem verifying your access to this course.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to course details page with an access message
    return <Navigate to={`/courses-detail/${courseId}?access=denied`} replace />;
  }

  return children;
};

export default CourseProgressProtection; 