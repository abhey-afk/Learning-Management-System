import {
    useCreateLectureMutation,
    useGetCourseLectureQuery,
  } from "../../../features/api/courseApi";
  import { Loader2, PlusCircle } from "lucide-react";
  import React, { useEffect, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { toast } from "sonner";
  import Lecture from "./Lecture";
  
  const CreateLecture = () => {
    const [lectureTitle, setLectureTitle] = useState("");
    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();
  
    const [createLecture, { data, isLoading, isSuccess, error }] =
      useCreateLectureMutation();
  
    const {
      data: lectureData,
      isLoading: lectureLoading,
      isError: lectureError,
      refetch,
    } = useGetCourseLectureQuery(courseId);
  
    const createLectureHandler = async () => {
      if (!lectureTitle.trim()) {
        toast.error("Lecture title is required.");
        return;
      }
      await createLecture({ lectureTitle, courseId });
      setLectureTitle("");
    };
  
    useEffect(() => {
      if (isSuccess) {
        refetch();
        toast.success(data.message);
      }
      if (error) {
        toast.error(error?.data?.message || "Something went wrong");
      }
    }, [isSuccess, error]);
  
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Add New Lecture</h1>
          <p className="text-gray-500 text-sm">Create a new lecture for this course</p>
        </div>
  
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col">
            <label htmlFor="lectureTitle" className="mb-1 font-medium text-sm">
              Lecture Title
            </label>
            <input
              id="lectureTitle"
              type="text"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder="e.g. Introduction to React"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => navigate(`/admin/courses/edit/${courseId}`)}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-200 transition"
            >
              Back to Course
            </button>
            <button
              onClick={createLectureHandler}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm transition ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Create Lecture
                </>
              )}
            </button>
          </div>
        </div>
  
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">All Lectures</h2>
          {lectureLoading ? (
            <p className="text-gray-500">Loading lectures...</p>
          ) : lectureError ? (
            <p className="text-red-500">Failed to load lectures.</p>
          ) : lectureData?.lectures?.length === 0 ? (
            <p className="text-gray-500">No lectures available.</p>
          ) : (
            <div className="space-y-4">
              {lectureData.lectures.map((lecture, index) => (
                <Lecture
                  key={lecture._id}
                  lecture={lecture}
                  courseId={courseId}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default CreateLecture;
  