import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";
import LectureTab from "./LectureTab";

const EditLecture = () => {
  const { courseId } = useParams();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/courses/edit/${courseId}/lecture`}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">
            Update Your Lecture
          </h1>
        </div>
      </div>

      <LectureTab />
    </div>
  );
};

export default EditLecture;
