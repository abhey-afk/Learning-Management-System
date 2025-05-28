import React, { useState, useEffect } from "react";
import { useLoadUserQuery, useUpdateUserMutation } from "../../features/api/authApi";
import { useGetCreatorCourseQuery } from "../../features/api/courseApi";
import { useGetPurchasedCoursesQuery } from "../../features/api/purchaseApi";
import { Pencil, Calendar, Mail, Phone, User, CheckCircle, Save, X, Upload, Globe, Venus, GraduationCap, BookOpen, Edit } from "lucide-react";

export default function Profile() {
  const { data, isLoading, isError, refetch } = useLoadUserQuery(); // Added isError for error handling
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  
  // Get instructor courses if user is an instructor
  const { data: instructorCoursesData } = useGetCreatorCourseQuery(undefined, {
    skip: !data?.user?.role || data?.user?.role !== "instructor"
  });
  
  // Get student's purchased courses if user is a student
  const { data: purchasedCoursesData } = useGetPurchasedCoursesQuery(undefined, {
    skip: !data?.user?.role || data?.user?.role !== "student"
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [instructorCourses, setInstructorCourses] = useState([]);

  useEffect(() => {
    if (data) {
      const userData = data.user;
      setStudent(userData);
      setFormData(userData);
      setPreviewImage(userData.photoUrl);
      
      // Handle different roles' data
      if (userData.role === "instructor" && instructorCoursesData?.courses) {
        setInstructorCourses(instructorCoursesData.courses);
      } else if (userData.role === "student" && purchasedCoursesData?.purchasedCourse) {
        setCourses(purchasedCoursesData.purchasedCourse || []);
      }
    }
  }, [data, instructorCoursesData, purchasedCoursesData]);

  // Handle input changes
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      setPreviewImage(photoUrl);
      setFormData({ ...formData, avatar: file });
    }
  };

  // Save user changes
  const saveChanges = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      // Create a proper FormData object for the request
      const formDataToSend = new FormData();
      
      // Add all user fields individually to match the backend's expected fields
      if (formData.firstName) formDataToSend.append("firstName", formData.firstName);
      if (formData.lastName) formDataToSend.append("lastName", formData.lastName);
      
      // Also include a name field (combined) for backward compatibility
      formDataToSend.append("name", `${formData.firstName || ''} ${formData.lastName || ''}`);
      
      // Add all other relevant fields
      if (formData.email) formDataToSend.append("email", formData.email);
      if (formData.phoneNumber) formDataToSend.append("phoneNumber", formData.phoneNumber);
      if (formData.phoneCode) formDataToSend.append("phoneCode", formData.phoneCode);
      if (formData.country) formDataToSend.append("country", formData.country);
      if (formData.state) formDataToSend.append("state", formData.state);
      if (formData.city) formDataToSend.append("city", formData.city);
      if (formData.gender) formDataToSend.append("gender", formData.gender);
      
      // Add profile photo if it's a File
      if (formData.avatar instanceof File) {
        formDataToSend.append("profilePhoto", formData.avatar);
      }
      
      console.log("Sending form data to backend:", Object.fromEntries(formDataToSend.entries()));
      
      const response = await updateUser(formDataToSend).unwrap();
      console.log("Update response:", response);
      
      // Update local state with the response data
      if (response.user) {
        setStudent(response.user);
        setFormData(response.user);
        if (response.user.photoUrl) {
          setPreviewImage(response.user.photoUrl);
        }
        
        // Update the user info in localStorage to reflect changes in navbar etc.
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const updatedUserInfo = { ...userInfo, ...response.user };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        // Dispatch auth event to update navbar
        window.dispatchEvent(new Event('user:login'));
      }
      
      setEditMode(false);
      await refetch(); // Refresh user data
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Update failed:", error);
      setErrorMessage(error.data?.message || "Failed to update profile. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load profile. Please try again later.</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No user data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md">
        <div className="bg-blue-600 p-6 flex items-center gap-6 text-white relative">
          <div className="relative">
            <img
              src={previewImage}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow object-cover"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
                <Upload className="text-blue-600" size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold capitalize">{student.firstName} {student.lastName}</h2>
            <p className="flex items-center text-sm mt-1">
              <Calendar size={16} className="mr-1" />
              Joined {student.createdAt?.slice(0, 10) || "N/A"}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-600 text-white text-center py-2">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-600 text-white text-center py-2">
            {errorMessage}
          </div>
        )}

        <div className="p-6 grid md:grid-cols-2 gap-6 text-gray-700">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Info</h3>
            {editMode ? (
              <>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Last Name"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Phone Number"
                />
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Country"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="State"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="City"
                />
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {/* Non-editable Role Field */}
                <div className="flex items-center text-gray-600 pt-2">
                  <GraduationCap size={16} className="mr-2" />
                  Role: {student.role} (Cannot be changed)
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <User size={16} className="mr-2" /> Username: {student.username}
                </div>
                <div className="flex items-center">
                  <GraduationCap size={16} className="mr-2" /> Role: {student.role}
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" /> Email: {student.email}
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" /> Phone: {student.phoneNumber}
                </div>
                <div className="flex items-center">
                  <Globe size={16} className="mr-2" /> Country: {student.country}
                </div>
                <div className="flex items-center">
                  <Venus size={16} className="mr-2" /> Gender: {student.gender}
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-2" /> Location: {student.city}, {student.state}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Course Stats</h3>
            {student?.role === "instructor" ? (
              // Instructor stats
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
                  <Edit className="mx-auto text-blue-600 mb-1" size={28} />
                  <p className="text-sm">Courses Created</p>
                  <p className="text-xl font-bold">{instructorCourses.length}</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
                  <CheckCircle className="mx-auto text-green-600 mb-1" size={28} />
                  <p className="text-sm">Published</p>
                  <p className="text-xl font-bold">{instructorCourses.filter(c => c.isPublished).length}</p>
                </div>
              </div>
            ) : (
              // Student stats
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
                  <GraduationCap className="mx-auto text-blue-600 mb-1" size={28} />
                  <p className="text-sm">Enrolled</p>
                  <p className="text-xl font-bold">{courses.length}</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
                  <CheckCircle className="mx-auto text-green-600 mb-1" size={28} />
                  <p className="text-sm">Completed</p>
                  <p className="text-xl font-bold">{courses.filter(c => c.progress === 100).length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-4 pb-6">
          {student?.role === "instructor" ? (
            // Instructor courses section
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Courses</h3>
              <div className="space-y-4">
                {instructorCourses.length === 0 ? (
                  <p className="text-sm text-gray-500">You haven't created any courses yet.</p>
                ) : (
                  instructorCourses.map((course) => (
                    <div
                      key={course._id}
                      className="bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-900">{course.courseTitle}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          course.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isPublished ? 'Published' : 'Unpublished'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{course.subTitle || 'No subtitle'}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Category: {course.category}</span>
                        <span>Students: {course.enrolledStudents?.length || 0}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            // Student courses section
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrolled Courses</h3>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-500">No courses enrolled yet.</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course._id}
                      className="bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <h4 className="text-md font-semibold text-gray-900">{course.courseId?.courseTitle}</h4>
                      <p className="text-sm text-gray-600">{course.courseId?.subTitle || course.courseId?.description}</p>
                      <div className="w-full bg-white h-2 mt-2 rounded-full">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-sm text-right text-gray-500 mt-1">{course.progress || 0}% complete</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          {editMode ? (
            <>
              <button
                onClick={saveChanges}
                className="bg-blue-600 text-white rounded-lg py-2 px-4 mr-2"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-300 text-black rounded-lg py-2 px-4"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white rounded-lg py-2 px-4"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}