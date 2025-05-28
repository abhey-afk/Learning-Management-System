import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, CheckCircle2, CirclePlay, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  useGetCourseProgressQuery, 
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation
} from "../../features/api/courseProgressApi";

const CourseProgress = () => {
  const { courseId } = useParams();
  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse] = useCompleteCourseMutation();
  const [incompleteCourse] = useInCompleteCourseMutation();
  
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const videoRef = useRef(null);

  // Initialize from API data once loaded
  useEffect(() => {
    if (data?.data?.courseDetails?.lectures?.length > 0 && !currentLecture) {
      setCurrentLecture(data.data.courseDetails.lectures[0]);
    }
  }, [data, currentLecture]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading course...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load course progress. Please try again later.</p>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">No course data available.</p>
      </div>
    );
  }

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails || {};
  const initialLecture = currentLecture || (courseDetails?.lectures?.length > 0 ? courseDetails.lectures[0] : null);

  // Calculate progress percentage
  const totalLectures = courseDetails?.lectures?.length || 0;
  const completedLectures = progress?.filter(prog => prog.viewed)?.length || 0;
  const progressPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  const isLectureCompleted = (lectureId) => {
    return progress?.some(prog => prog.lectureId === lectureId && prog.viewed) || false;
  };

  const handleLectureProgress = async (lectureId) => {
    try {
      await updateLectureProgress({ courseId, lectureId });
      // Refetch to update the UI with the latest progress
      refetch();
      toast.success("Lecture marked as completed");
      
      // Auto-mark course as completed if all lectures are now viewed
      const updatedCompletedLectures = completedLectures + 1;
      if (!completed && updatedCompletedLectures === totalLectures) {
        await completeCourse(courseId);
        toast.success("Course automatically marked as completed!");
        refetch();
      }
    } catch (error) {
      console.error("Failed to update lecture progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleVideoEnded = () => {
    // Mark lecture as completed when video has finished playing
    if (!isLectureCompleted(currentLecture?._id || initialLecture._id)) {
      handleLectureProgress(currentLecture?._id || initialLecture._id);
    }
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    toast.info(`Selected: ${lecture.lectureTitle}`);
  };

  const handleCompleteCourse = async () => {
    try {
      if (completed) {
        // If already completed, confirming reset
        if (showResetConfirm) {
          await incompleteCourse(courseId);
          toast.success("Course progress reset. You can now retake this course.");
          setShowResetConfirm(false);
        } else {
          // First click just shows confirmation
          setShowResetConfirm(true);
          return;
        }
      } else {
        await completeCourse(courseId);
        toast.success("Course marked as completed! 🎉");
      }
      
      // Refetch to ensure UI reflects server state
      refetch();
    } catch (error) {
      console.error("Failed to toggle course completion:", error);
      toast.error("Failed to update course status");
      setShowResetConfirm(false);
    }
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  if (!initialLecture) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">No lectures available for this course.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header Section */}
      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800">{courseTitle}</h1>
          {courseDetails?.creator && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Instructor:</span>
              <span className="font-medium">
                {courseDetails.creator.firstName} {courseDetails.creator.lastName}
              </span>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Your progress</span>
            <span className="font-medium">{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {completedLectures} of {totalLectures} lectures completed
          </div>
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {courseDetails?.lectures?.length || 0} Lectures
            </span>
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              {courseDetails?.courseLevel || "Beginner"}
            </span>
          </div>
          
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Reset course progress?</span>
              <button
                onClick={handleCompleteCourse}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Yes, Reset
              </button>
              <button
                onClick={cancelReset}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleCompleteCourse}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                completed 
                  ? "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {completed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Completed</span>
                  <RefreshCw className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Mark Complete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Video Player Section */}
        <div className="flex-1">
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              src={currentLecture?.videoUrl || initialLecture.videoUrl}
              controls
              className="w-full h-full"
              onEnded={handleVideoEnded}
            />
          </div>
          <div className="mt-4 p-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {currentLecture?.lectureTitle || initialLecture.lectureTitle}
            </h3>
            {completed && isLectureCompleted(currentLecture?._id || initialLecture._id) && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>You've completed this lecture</span>
              </div>
            )}
          </div>
        </div>

        {/* Lectures List */}
        <div className="w-full lg:w-96">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Lectures</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {courseDetails?.lectures?.map((lecture) => (
              <div
                key={lecture._id}
                onClick={() => handleSelectLecture(lecture)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  lecture._id === currentLecture?._id
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <CirclePlay className="w-6 h-6 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-800">
                      {lecture.lectureTitle}
                    </span>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-700">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;