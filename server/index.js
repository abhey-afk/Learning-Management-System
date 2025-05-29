import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config({});
import connectDB from "./database/db.js";
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.route.js";
import mediaRouter from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import { stripeWebhook } from "./controllers/coursePurchase.controller.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import healthRoute from "./routes/health.route.js";

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
    console.error('Please set these variables in your Render dashboard.');
    process.exit(1);
}

console.log('Environment variables validated successfully');
console.log('Connecting to MongoDB...');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Configure CORS with multiple allowed origins
const allowedOrigins = [
    'https://learning-management-system-72cf.onrender.com',
    'https://your-frontend-url.vercel.app',
    process.env.CLIENT_URL,
    'http://localhost:5173' // Development URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// IMPORTANT: The Stripe webhook route must be defined BEFORE express.json() middleware
// because Stripe needs the raw body to validate the webhook signature
app.post("/api/v1/purchase/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

// AFTER the webhook route, apply JSON parsing middleware for all other routes
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/health", healthRoute);

app.get("/home", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hello i am coming from backend"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Stripe webhook endpoint: http://localhost:${PORT}/api/v1/purchase/webhook`);
});
