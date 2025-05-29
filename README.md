# Learning Management System (LMS)

A modern, full-stack Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform enables seamless course creation, secure payments, and interactive learning experiences.

## 🚀 Key Features

### For Students
- 📚 Browse and enroll in courses
- 💳 Secure payment processing with Stripe
- 📊 Track learning progress
- 📱 Responsive design for all devices

### For Instructors
- 📝 Create and manage courses
- 📹 Upload and organize course content
- 💰 Handle course payments
- 📈 Monitor student progress

## 🛠️ Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- TailwindCSS for styling
- Protected routing

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for media storage
- Stripe for payments

## 🔗 Live Demo
- Frontend: https://learning-management-system-72cf.onrender.com
- Backend API: https://lms-backend-jrz9.onrender.com

## ⚙️ Environment Variables

### Backend
```env
PORT=8080
MONGO_URI=your_mongodb_uri
SECRET_KEY=your_jwt_secret
CLIENT_URL=your_frontend_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend
```env
VITE_API_URL=your_backend_url
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 📝 License
MIT License

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 