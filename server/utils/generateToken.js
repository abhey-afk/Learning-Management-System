import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  try {
    if (!process.env.SECRET_KEY) {
      throw new Error('SECRET_KEY is not defined in environment variables');
    }

    console.log("Generating token for user:", user._id);
    
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    console.log("Token generated successfully");

    // Set cookie with safe cross-domain settings
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true, // Ensure cookie is sent over HTTPS only
      sameSite: "none", // Allow cross-site cookie
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log("Cookie set successfully");

    // Also include token directly in the response for direct client-side access
    return res
      .status(200)
      .json({
          success: true,
          message,
          user,
          token // Send token in response body too
      });
  } catch (error) {
    console.error("Token generation error:", {
      message: error.message,
      stack: error.stack
    });
    throw error; // Re-throw to be caught by the login handler
  }
};