import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import 'react-phone-number-input/style.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authEvents } from '../components/Navbar';

const InputField = ({ label, id, type = 'text', register, rules, errors }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="font-medium">{label}</label>
    <input
      id={id}
      type={type}
      {...register(id, rules)}
      className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors[id] && <p className="text-red-500 text-sm">{errors[id].message}</p>}
  </div>
);

const Signup = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setApiError('');
      
      const formData = {
        ...data,
        country: country?.name || '',
        state: state?.name || '',
        city: city?.name || '',
        phoneCode: '+91',
      };
      
      const response = await axios.post('https://lms-backend-jrz9.onrender.com/api/v1/user/register', formData);
      
      // If login is automatic after registration (depends on your backend)
      if (response.data.token) {
        // Store token in cookie
        Cookies.set("authToken", response.data.token, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Store user data
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        
        // Dispatch login event
        window.dispatchEvent(authEvents.login);
      }
      
      // Show success message
      alert(response.data.message || 'User registered successfully');
      
      // Navigate to login or home depending on your flow
      navigate(response.data.token ? '/' : '/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 p-8 bg-white rounded-2xl shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>

        {[{ id: 'username', label: 'Username' }, { id: 'firstName', label: 'First Name' }, { id: 'lastName', label: 'Last Name' }].map(field => (
          <InputField
            key={field.id}
            {...field}
            register={register}
            rules={{ required: `${field.label} is required` }}
            errors={errors}
          />
        ))}

        <InputField
          id="email"
          label="Email"
          type="email"
          register={register}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: 'Invalid email',
            },
          }}
          errors={errors}
        />

        <InputField
          id="password"
          label="Password"
          type="password"
          register={register}
          rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
          errors={errors}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="font-medium">Phone Number</label>
          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: 'Phone number is required',
              validate: value => isValidPhoneNumber(value) || 'Invalid phone number',
            }}
            render={({ field }) => (
              <PhoneInput {...field} id="phone" defaultCountry="IN" international className="border p-2 rounded-xl" />
            )}
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
        </div>

        {/* Role Selection Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Role</label>
          <select 
            {...register('role', { 
              required: 'Role is required' 
            })} 
            className="border p-2 rounded-xl"
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Country</label>
          <CountrySelect onChange={setCountry} placeHolder="Select Country" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">State</label>
          <StateSelect countryid={country?.id} onChange={setState} placeHolder="Select State" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">City</label>
          <CitySelect countryid={country?.id} stateid={state?.id} onChange={setCity} placeHolder="Select City" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Gender</label>
          <select {...register('gender', { required: 'Gender is required' })} className="border p-2 rounded-xl">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
        </div>

        {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;