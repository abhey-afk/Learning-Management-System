import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useLoginUserMutation } from "../features/api/authApi";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { authEvents } from "../components/Navbar";

const InputField = ({ label, type, registerProps, error, toggle, show }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <div className="relative">
      <input
        type={type} 
        {...registerProps}
        className="w-full px-4 py-2 border rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {toggle && (
        <button
          type="button"
          onClick={toggle}
          className="absolute top-2 right-3 text-gray-600"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>

    {error && <p className="text-red-500 text-sm">{error.message}</p>}
  </div>
);

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginUser, { isLoading }] = useLoginUserMutation();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiError("");
      setSuccess("");
      
      // Execute the login mutation
      const response = await loginUser(data).unwrap();

      // Store token in cookie with security options
      Cookies.set("authToken", response.token, {
        expires: 7, // Expires in 7 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Store user data in localStorage if needed
      localStorage.setItem("userInfo", JSON.stringify(response.user));

      // Dispatch the login event to notify components about auth state change
      window.dispatchEvent(authEvents.login);

      setSuccess("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setApiError(err.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Username"
            type="text"
            registerProps={register("username", { 
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters"
              }
            })}
            error={errors.username}
          />

          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            registerProps={register("password", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            error={errors.password}
            toggle={() => setShowPassword((prev) => !prev)}
            show={showPassword}
          />

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-blue-500 hover:underline text-sm"
            >
              Forgot Password?
            </button>
          </div>

          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-500 hover:underline"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;