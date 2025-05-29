import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import HeroSection from "./pages/student/HeroSection";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Course from "./pages/student/Course";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import AddCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/student/CourseDetail";
import CourseProgress from "./pages/student/CourseProgress";
import SearchPage from "./pages/student/SearchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import CourseProgressProtection from "./components/CourseProgressProtection";
import NotFound from "./pages/NotFound";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Course />
          </>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "MyLearning",
        element: <ProtectedRoute>
          <MyLearning />
        </ProtectedRoute>,
      },
      {
        path: "profile",
        element: <ProtectedRoute>
          <Profile />
        </ProtectedRoute>,
      },
      {
        path: "courses-detail/:courseId", 
        element: <CourseDetail />
      },
      {
        path: "courses-progress/:courseId",
        element: <ProtectedRoute>
          <CourseProgressProtection>
            <CourseProgress />
          </CourseProgressProtection>
        </ProtectedRoute>
      },
      {
        path: "search",
        element: <SearchPage />
      },

      // admin routes start from here - protected for instructors only
      {
        path: "admin",
        element: <AdminProtectedRoute>
          <Sidebar />
        </AdminProtectedRoute>,
        children: [
          {
            path: "", // This handles the exact "/admin" path
            element: <Navigate to="/admin/dashboard" replace />
          },
          {
            path: "dashboard",
            element: <Dashboard />
          },
          {
            path: "courses",
            element: <CourseTable />
          },
          {
            path: "courses/create",
            element: <AddCourse />
          },
          {
            path: "courses/edit/:courseId",
            element: <EditCourse />
          },
          {
            path: "courses/edit/:courseId/lecture",
            element: <CreateLecture />
          },
          {
            path: "courses/edit/:courseId/lecture/:lectureId",
            element: <EditLecture />
          }
        ]
      },
      // 404 page - must be last
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
])

function App() {
  return (
    <main>
      <RouterProvider router={appRouter} />
    </main>
  )
}

export default App;
