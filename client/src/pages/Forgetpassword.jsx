import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

const ForgetPassword = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data) => {
    if (step === 1) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      alert(`Mock OTP sent to ${data.email}: ${otp}`);
      setStep(2);
    } else if (step === 2) {
      data.otp === generatedOtp ? setStep(3) : alert("Invalid OTP");
    } else {
      alert("Password reset successfully (mock)");
      setStep(1);
    }
  };

  const inputStyle = "w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelStyle = "block mb-1 font-medium";
  const errorStyle = "text-red-500 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <label className={labelStyle}>Email</label>
              <input type="email" {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
              })} className={inputStyle} />
              {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
            </>
          )}
          {step === 2 && (
            <>
              <label className={labelStyle}>Enter OTP</label>
              <input type="text" {...register("otp", { required: "OTP is required" })} className={inputStyle} />
              {errors.otp && <p className={errorStyle}>{errors.otp.message}</p>}
            </>
          )}
          {step === 3 && (
            <>
              <label className={labelStyle}>New Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"}
                  {...register("newPassword", { required: "Password is required" })}
                  className={`${inputStyle} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-2 right-3 text-gray-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && <p className={errorStyle}>{errors.newPassword.message}</p>}
            </>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
            {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
