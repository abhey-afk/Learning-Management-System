import React from "react";
import { Link } from "react-router-dom";
import CourseTab from "./CourseTab";

const EditCourse = () => {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>
          Add detail information regarding course
        </h1>
        <Link to="lecture" style={{ textDecoration: "none", color: "#2563eb" }}>
          Go to lectures page
        </Link>
      </div>
      <CourseTab />
    </div>
  );
};

export default EditCourse;
