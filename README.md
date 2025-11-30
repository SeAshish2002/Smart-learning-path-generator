# Smart Learning Path Generator

**Developed by: Ashish Kumar**

An adaptive educational platform that creates personalized learning paths for students based on their knowledge level, learning style, and goals. The system generates custom content, quizzes, and tracks progress with intelligent tutoring capabilities.

## 🚀 Features

- **Personalized Learning Paths**: Custom learning paths tailored to individual students
- **Progress Tracking**: Detailed analytics and progress monitoring dashboard
- **Adaptive Quizzes**: Intelligent quiz system that adjusts to student performance
- **Content Generation**: Optional GPT-4 integration for content generation and tutoring
- **OAuth Authentication**: Login with Google or GitHub
- **Study Groups**: Collaborative learning features (coming soon)
- **Role Management**: Support for students, instructors, and parents

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-learning-path-generator
```

### 2. Install Dependencies

Install dependencies for root, server, and client:

```bash
npm run install-all
```

Or install them separately:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set Up PostgreSQL Database

1. Create a new PostgreSQL database:

```sql
CREATE DATABASE learning_path_db;
```

2. Or use the PostgreSQL command line:

```bash
createdb learning_path_db
```

### 4. Configure Environment Variables

#### Server Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_NAME=learning_path_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# OAuth Configuration (Optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend URL (for OAuth callbacks)
FRONTEND_URL=http://localhost:3000
```

#### Client Configuration

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Set Up OAuth (Optional)

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth Setup:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## 🚀 Running the Application

### Development Mode

Run both server and client concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend client
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Production Mode

```bash
# Build the React app
cd client
npm run build

# Start the server
cd ../server
npm start
```

## 📁 Project Structure

```
smart-learning-path-generator/
├── client/                 # React frontend application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main App component
│   └── package.json
│
├── server/                 # Node.js backend application
│   ├── config/            # Configuration files
│   │   ├── database.js    # Database configuration
│   │   └── passport.js    # OAuth configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── index.js           # Server entry point
│   └── package.json
│
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Dockerfile for production
└── README.md              # This file
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **learning_paths**: Personalized learning paths
- **quizzes**: Quiz questions and assessments
- **progress**: User progress tracking
- **study_groups**: Collaborative study groups
- **study_group_members**: Many-to-many relationship for group members

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/github` - GitHub OAuth login

### Learning Paths
- `POST /api/learning-paths` - Create new learning path
- `GET /api/learning-paths` - Get user's learning paths
- `GET /api/learning-paths/:id` - Get specific learning path
- `PUT /api/learning-paths/:id/progress` - Update progress
- `DELETE /api/learning-paths/:id` - Delete learning path

### Quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/learning-path/:id` - Get quizzes for learning path
- `GET /api/quizzes/:id` - Get specific quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/analytics` - Get progress analytics
- `GET /api/progress/learning-path/:id` - Get progress for learning path

### AI
- `POST /api/ai/explain` - Get AI tutoring explanation
- `POST /api/ai/generate-content` - Generate learning content
- `POST /api/ai/generate-questions` - Generate quiz questions

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t smart-learning-path .

# Run the container
docker run -p 5000:5000 smart-learning-path
```

## 🧪 Testing

Currently, the project doesn't include automated tests. To test manually:

1. Register a new user
2. Create a learning path
3. Generate and take a quiz
4. Check progress analytics

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- Change `JWT_SECRET` to a strong random string in production
- Use HTTPS in production
- Keep your API keys secure
- Regularly update dependencies

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
- Change `PORT` in server `.env`
- Kill process using port: `lsof -ti:5000 | xargs kill`

### OAuth Not Working
- Verify callback URLs match exactly
- Check OAuth credentials in `.env`
- Ensure OAuth apps are properly configured

### AI Features Not Working
- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key is valid and has credits
- Review OpenAI API documentation

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Ashish Kumar**

Developed with dedication and passion for creating innovative educational solutions.

## 👥 Contributing

This is a learning project. Feel free to fork, modify, and use it for your own learning purposes!

## 📧 Support

For issues or questions, please open an issue on the repository.

## 🎓 Learning Resources

See `INTERVIEW_TOPICS.md` for a comprehensive list of topics and technologies used in this project that you should learn for interviews.

---

**Made with ❤️ by Ashish Kumar**

**Happy Learning! 🚀**

