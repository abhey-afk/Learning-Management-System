import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req,res) => {
    try {
        const {username, firstName, lastName, email, phoneCode, 
          phoneNumber, role, country, state, city, gender, password} = req.body; 

        console.log("Registration attempt for:", { email, username });

        // Validate required fields
        const requiredFields = {username, firstName, lastName, email, phoneCode, 
            phoneNumber, role, country, state, city, gender, password};
        
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            console.log("Missing fields:", missingFields);
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                missingFields
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `User already exists with this ${field}`
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username, firstName, lastName, email, phoneCode, 
            phoneNumber, role, country, state, city, gender,
            password: hashedPassword 
        });

        console.log("User created successfully:", newUser._id);

        return res.status(201).json({
            success: true,
            message: "Account created successfully."
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to register",
            error: error.message
        });
    }
}
export const login = async (req,res) => {
    try {
        console.log("Login attempt received:", { username: req.body.username });
        
        const {username, password} = req.body;
        if(!username || !password){
            console.log("Login failed: Missing fields");
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Try to find user by either username or email
        console.log("Searching for user...");
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if(!user){
            console.log("Login failed: User not found");
            return res.status(400).json({
                success: false,
                message: "Incorrect username or password"
            });
        }

        console.log("User found, verifying password...");
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        if(!isPasswordMatch){
            console.log("Login failed: Password mismatch");
            return res.status(400).json({
                success: false,
                message: "Incorrect username or password"
            });
        }

        console.log("Password verified, generating token...");
        return generateToken(res, user, `Welcome back ${user.firstName}`);

    } catch (error) {
        console.error("Login error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return res.status(500).json({
            success: false,
            message: "Failed to login",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const { 
            name, email, firstName, lastName, phoneNumber, 
            phoneCode, country, state, city, gender 
        } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }

        // Prepare updated data with all possible fields
        const updatedData = {};
        
        // Handle name field - could be full name or individual first/last name fields
        if (name) {
            updatedData.name = name;
        }
        
        // Handle individual name fields if provided
        if (firstName) {
            updatedData.firstName = firstName;
        }
        
        if (lastName) {
            updatedData.lastName = lastName;
        }
        
        // Handle all other user fields if provided
        if (email) updatedData.email = email;
        if (phoneNumber) updatedData.phoneNumber = phoneNumber;
        if (phoneCode) updatedData.phoneCode = phoneCode;
        if (country) updatedData.country = country;
        if (state) updatedData.state = state;
        if (city) updatedData.city = city;
        if (gender) updatedData.gender = gender;
        
        // Handle profile photo if provided
        if (profilePhoto) {
            // Delete old photo if it exists
            if(user.photoUrl){
                const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
                deleteMediaFromCloudinary(publicId);
            }

            // Upload new photo
            const cloudResponse = await uploadMedia(profilePhoto.path);
            updatedData.photoUrl = cloudResponse.secure_url;
        }

        console.log("Updating user with data:", updatedData);

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updatedData, 
            {new: true}
        ).select("-password");

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
}