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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-md">
        <div className="bg-blue-600 p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-white relative">
          <div className="relative">
            <img
              src={previewImage}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow object-cover"
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
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold capitalize">{student.firstName} {student.lastName}</h2>
            <p className="flex items-center justify-center sm:justify-start text-sm mt-1">
              <Calendar size={16} className="mr-1" />
              Joined {student.createdAt?.slice(0, 10) || "N/A"}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-600 text-white text-center py-2 text-sm sm:text-base">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-600 text-white text-center py-2 text-sm sm:text-base">
            {errorMessage}
          </div>
        )}

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-gray-700">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Personal Info</h3>
            {editMode ? (
              <>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="Last Name"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="Phone Number"
                />
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="Country"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="State"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                  placeholder="City"
                />
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm sm:text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </>
            ) : (
              <div className="space-y-2">
                <p className="flex items-center text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  {student.firstName} {student.lastName}
                </p>
                <p className="flex items-center text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  {student.email}
                </p>
                <p className="flex items-center text-sm sm:text-base">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  {student.phoneNumber || 'Not provided'}
                </p>
                <p className="flex items-center text-sm sm:text-base">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  {[student.city, student.state, student.country].filter(Boolean).join(', ') || 'Location not provided'}
                </p>
                <p className="flex items-center text-sm sm:text-base">
                  <Venus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                  {student.gender || 'Not specified'}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Course Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <span>Role: {student.role}</span>
              </div>
              
              {student.role === "student" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span>Enrolled Courses: {courses.length}</span>
                  </div>
                  {courses.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {courses.map((course) => (
                        <div key={course._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm sm:text-base font-medium">{course.courseTitle}</span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(course.purchasedOn).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {student.role === "instructor" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span>Created Courses: {instructorCourses.length}</span>
                  </div>
                  {instructorCourses.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {instructorCourses.map((course) => (
                        <div key={course._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm sm:text-base font-medium">{course.courseTitle}</span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            Students: {course.enrolledStudents?.length || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t flex justify-end gap-3">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(student);
                  setPreviewImage(student.photoUrl);
                }}
                className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={isUpdating}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}