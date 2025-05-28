# Learning Management System (LMS)

A full-featured Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) that enables course creation, management, and learning experiences.

## Features

### For Students
- 📚 Browse and search available courses
- 🛒 Purchase courses securely
- 📝 Track course progress
- 👤 Personal profile management
- 📖 Access to purchased course content
- 🎯 Course progress tracking

### For Administrators/Instructors
- 📊 Comprehensive dashboard
- ➕ Course creation and management
- 📝 Lecture creation and editing
- 👥 User management
- 📈 Progress monitoring
- 🔒 Protected admin routes

## Technology Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Protected routing
- Responsive design

### Backend
- Node.js & Express.js
- MongoDB for database
- JWT authentication
- File upload capabilities
- RESTful API architecture

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── app/           # Redux store configuration
│   │   ├── components/    # Reusable components
│   │   ├── features/      # Redux features/slices
│   │   ├── pages/        # Page components
│   │   └── layout/       # Layout components
│
├── server/                 # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/abhey-afk/Learning-Management-System.git
cd Learning-Management-System
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
Create `.env` files in both client and server directories with necessary configurations.

Server `.env` example:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

Client `.env` example:
```
VITE_API_URL=http://localhost:5000
```

4. Start the development servers

For server:
```bash
cd server
npm run dev
```

For client:
```bash
cd client
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/signup - User registration
- POST /api/auth/login - User login
- POST /api/auth/forgot-password - Password recovery

### Courses
- GET /api/courses - Get all courses
- GET /api/courses/:id - Get course details
- POST /api/courses - Create new course (admin only)
- PUT /api/courses/:id - Update course (admin only)
- DELETE /api/courses/:id - Delete course (admin only)

### Course Progress
- GET /api/progress/:courseId - Get user's course progress
- POST /api/progress/:courseId - Update course progress
- GET /api/progress/my-courses - Get user's enrolled courses

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this LMS
- Special thanks to the open-source community for the amazing tools and libraries 