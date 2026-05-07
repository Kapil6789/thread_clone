# Thread Clone

A full-stack Twitter/Threads-like social media application built with React, Express, and PostgreSQL. Users can create posts, comment, like, repost, follow other users, and manage their profiles with image uploads via Cloudinary.

## 🚀 Features

- **User Management**
  - User registration and authentication with JWT
  - User profiles with bio and profile pictures
  - Password hashing with bcrypt
  
- **Posts & Content**
  - Create, edit, and delete posts/threads
  - Add media to posts (via Cloudinary)
  - View all posts with pagination
  - Single post view with all interactions

- **Interactions**
  - Like posts and comments
  - Comment on posts
  - Reply to threads
  - Repost content
  
- **Social Features**
  - Follow/Unfollow users
  - View user profiles
  - Search functionality
  - User feed based on followed users

- **Image Handling**
  - Upload and store images via Cloudinary
  - Auto-generated placeholder images using Gravatar

## 🛠️ Tech Stack

### Frontend (Client)
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Material-UI (MUI)** - UI component library
- **React Toastify** - Toast notifications
- **React Icons** - Icon library
- **Emotion** - CSS-in-JS styling

### Backend (Server)
- **Express 5** - Node.js framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image hosting and management
- **Faker.js** - Seed data generation

## 📁 Project Structure

```
thread_clone/
├── client/                          # React frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Shared components (Header, Navbar, Loading)
│   │   │   ├── Home/               # Home page components (Post, Input, Comments)
│   │   │   ├── menu/               # Menu components
│   │   │   ├── modals/             # Modal dialogs
│   │   │   └── search/             # Search components
│   │   ├── pages/
│   │   │   ├── Error.jsx
│   │   │   ├── Register.jsx
│   │   │   └── protected/          # Protected routes
│   │   │       ├── Home.jsx
│   │   │       ├── Search.jsx
│   │   │       ├── SinglePost.jsx
│   │   │       └── profile/        # User profile pages
│   │   ├── redux/                  # Redux store, slices, and services
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                          # Express backend
│   ├── controller/                  # Route handlers
│   │   ├── user.js
│   │   ├── post.js
│   │   └── comment.js
│   ├── routes/                      # API routes
│   │   ├── user.js
│   │   ├── post.js
│   │   └── comments.js
│   ├── middleware/                  # Custom middleware
│   │   └── auth.js                 # JWT authentication
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/             # Database migrations
│   │   └── connector.js            # Prisma client setup
│   ├── config/
│   │   └── cloudinary.js           # Cloudinary configuration
│   ├── constant/
│   │   └── const.js                # Application constants
│   ├── seeders/                     # Seed data generators
│   │   ├── user.js
│   │   ├── post.js
│   │   ├── comment.js
│   │   ├── follower.js
│   │   ├── replies.js
│   │   ├── repost.js
│   │   └── like.js
│   └── package.json
│
└── README.md                        # Project documentation
```

## 📊 Database Schema

### Models

**User**
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `bio` - User bio (optional)
- `profilePic` - Profile picture URL
- `createdAt`, `updatedAt` - Timestamps
- Relations: threads, posts, comments, followers, following, likes, replies, reposts

**Post**
- `id` - Primary key
- `text` - Post content
- `media` - Media URL (optional)
- `adminId`, `authorId` - Creator reference
- `createdAt` - Timestamp
- Relations: comments, replies, reposts, likes

**Comment**
- `id` - Primary key
- `text` - Comment content
- `authorId` - Commenter reference
- `postId` - Post reference
- `createdAt` - Timestamp
- Relations: likes

**Reply**
- `id` - Primary key
- `text` - Reply content
- `authorId` - Replier reference
- `postId` - Post reference
- Relations: likes

**Followers**
- `followerId` - User following
- `followingId` - User being followed
- Unique constraint on (followerId, followingId)

**Like**
- Tracks likes on posts and comments

**Repost**
- Tracks reposts of content

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Cloudinary account for image uploads

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Kapil6789/thread_clone.git
cd thread_clone
```

2. **Setup Server**
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/thread_clone
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. **Setup Database**
```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run seed
```

4. **Setup Client**
```bash
cd ../client
npm install
```

### Running the Application

**Start Server** (from server directory):
```bash
npm run dev
```
Server runs on `http://localhost:5000` (or configured port)

**Start Client** (from client directory):
```bash
npm run dev
```
Client runs on `http://localhost:5173`

### Build for Production

**Client:**
```bash
npm run build
```

**Server:**
```bash
npm start
```

## 🔌 API Endpoints

### User Routes (`/api/v1/user`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile/:id` - Get user profile
- `PUT /edit/:id` - Update user profile
- `PUT /follow/:id` - Follow user
- `PUT /unfollow/:id` - Unfollow user

### Post Routes (`/api/v1/post`)
- `POST /addPost` - Create new post
- `GET /` - List all posts (with pagination)
- `GET /:id` - Get single post
- `PUT /like/:id` - Like/Unlike post
- `PUT /repost/:id` - Repost content
- `DELETE /:id` - Delete post

### Comment Routes (`/api/v1/comments`)
- `POST /add` - Add comment to post
- `PUT /like/:id` - Like/Unlike comment
- `DELETE /:id` - Delete comment

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are issued on login/registration
- Sent as cookies with requests
- Verified using `auth` middleware on protected routes
- Token contains user ID and is signed with `JWT_SECRET`

## 🖼️ Image Management

Images are handled via **Cloudinary**:
- User profile pictures
- Post media/attachments
- Automatic URL generation and storage
- Fallback to Gravatar for default profile pictures

## 🌱 Data Seeders

The project includes seeders for development/testing:
```javascript
// Uncomment in server/index.js to seed data
// createUser(1)        // Create 1 user with posts
// followers(1)         // Create follower relationships
// postByUser(1)        // Create posts
// comments(1)          // Create comments
// replies(1)           // Create replies
// repost(1)            // Create reposts
// likes(1)             // Create likes
```

## 📝 Environment Variables

### Server `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/thread_clone
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5000
NODE_ENV=development
```

### Client `.env` (if needed)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📦 Dependencies Overview

### Frontend Key Dependencies
- **@reduxjs/toolkit** - Redux state management
- **react-router-dom** - Routing
- **@mui/material** - UI components
- **react-toastify** - Notifications
- **@emotion/react** - Styling

### Backend Key Dependencies
- **@prisma/client** - Database ORM
- **express** - Web framework
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **cloudinary** - Image hosting
- **@faker-js/faker** - Test data generation

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC

## 👨‍💻 Author

Kapil

---

**Happy Coding! 🎉**
