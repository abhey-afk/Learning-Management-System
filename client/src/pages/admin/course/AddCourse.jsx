import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCourseMutation } from "../../../features/api/courseApi";
import { toast } from "sonner";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] =
    useCreateCourseMutation();

  const navigate = useNavigate();

  const createCourseHandler = async () => {
    await createCourse({ courseTitle, category });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created.");
      navigate("/admin/courses");
    }
  }, [isSuccess, error]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add a course – provide some basic details
        </h1>
        <p className="text-sm text-gray-600">
          Fill in the course title and category to proceed.
        </p>
      </div>

      <div className="space-y-4">
        {/* Course Title Input */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm text-gray-700">Title</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Your Course Name"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Select */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm text-gray-700">Category</label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Next JS">Next JS</option>
            <option value="Data Science">Data Science</option>
            <option value="Frontend Development">Frontend Development</option>
            <option value="Fullstack Development">Fullstack Development</option>
            <option value="MERN Stack Development">MERN Stack Development</option>
            <option value="Javascript">Javascript</option>
            <option value="Python">Python</option>
            <option value="Docker">Docker</option>
            <option value="MongoDB">MongoDB</option>
            <option value="HTML">HTML</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/courses")}
            className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100 transition"
          >
            Back
          </button>
          <button
            onClick={createCourseHandler}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white transition ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Please wait..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
