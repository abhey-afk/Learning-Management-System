import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import Cookies from "js-cookie";

const USER_API = "https://lms-backend-jrz9.onrender.com/api/v1/user/";

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include',
        prepareHeaders: (headers) => {
            // Get the token from both cookie and localStorage
            const token = Cookies.get('authToken') || localStorage.getItem('authToken');
            
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            })
        }),
        loginUser: builder.mutation({
            query: (inputData) => {
              console.log("Login data being sent to server:", JSON.stringify(inputData));
              return {
                url: "login",
                method: "POST",
                body: inputData
              };
            },
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    console.log("Login response received:", JSON.stringify(result.data));
                    
                    // Store the token in localStorage for future API calls
                    if (result.data.token) {
                        localStorage.setItem('authToken', result.data.token);
                        
                        // Also set as cookie for redundancy
                        Cookies.set('authToken', result.data.token, { 
                            expires: 7,
                            secure: true,
                            sameSite: 'None'
                        });
                    }
                    
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log("Login error details:", JSON.stringify(error, null, 2));
                }
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try { 
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
        })
    })
});
export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation
} = authApi;