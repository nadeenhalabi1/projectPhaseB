CV Screening System

Project Description
This is an intelligent resume screening system that automates the recruitment process. The system helps recruiters by automatically processing uploaded resumes, extracting relevant information using artificial intelligence, and ranking candidates based on how well they match job requirements.
Recruiters create job postings with specific evaluation criteria and assign weights to each criterion based on importance. When candidates upload their resumes, the system processes the files, extracts text content, uses AI to analyze the resumes against the job criteria, and automatically ranks all candidates. Recruiters can then view a ranked list with detailed scoring breakdowns and manage candidates through different stages of the hiring process.

Development Process

Authentication System
We developed a secure authentication system using JWT tokens. The system uses two types of tokens: short-lived access tokens for API requests and long-lived refresh tokens stored in secure HTTP-only cookies. When a user logs in or registers, the backend generates both tokens. The access token is sent to the frontend and stored in localStorage, while the refresh token is stored in an HTTP-only cookie that cannot be accessed by JavaScript, providing protection against XSS attacks.
The frontend includes an Axios interceptor that automatically adds the access token to all API requests. If a request fails with a 401 error, the interceptor automatically attempts to refresh the token using the refresh token cookie. If refresh succeeds, the original request is retried. If refresh fails, the user is logged out and redirected to the login page. This creates a seamless user experience where users stay logged in as long as their refresh token is valid.\

Resume Upload and Processing
We built a file upload system that accepts multiple resume files in PDF, DOCX, and TXT formats. The frontend includes a drag-and-drop interface where users can select multiple files. Each file is validated client-side for type and size before upload. When files are uploaded, they are sent to the backend as multipart form data.
The backend uses Multer middleware to receive and save the files temporarily. Each file is given a unique name using UUID to prevent conflicts. The system then extracts text from each file using format-specific parsers: pdf-parse for PDF files, mammoth for DOCX and DOC files, and direct file reading for TXT files. After text extraction, the original file is immediately deleted to save storage space.

AI Extraction and Evaluation
We integrated OpenAI API to extract structured information from resume text and evaluate candidates. The system builds a detailed prompt that includes the resume text and all job criteria with their descriptions. This prompt is sent to OpenAI with instructions to extract candidate information and provide scores from 0 to 10 for each criterion, along with explanations.
OpenAI returns structured JSON data containing the candidate's name, email, phone number, scores for each criterion, explanations for the scores, and evidence from the resume. This data is stored in the database along with the original resume text. The system also calculates and stores a hash of the criteria structure, which is used later to detect if criteria have changed and re-evaluation is needed.

KNN Ranking Algorithm
We implemented a KNN-based ranking algorithm to score and rank candidates. The algorithm works by representing each candidate as a vector of normalized scores, where each score corresponds to one evaluation criterion. An ideal vector is created representing the perfect candidate with maximum scores in all criteria.
For each candidate, the system calculates the weighted Euclidean distance from the ideal vector. Each criterion's contribution to the distance is multiplied by its weight, so more important criteria have greater influence. The distance is then converted to a similarity score from 0 to 100, where higher scores indicate better matches
All candidates are sorted by their similarity scores, and ranks are assigned. The scores and ranks are stored in the database so they don't need to be recalculated every time candidates are viewed. This makes the system fast even with hundreds of candidates.

Smart Re-ranking
We developed a smart re-ranking feature that detects when job criteria have changed. The system compares the current criteria hash with the hash stored for each candidate. If the hashes don't match, it means the criteria structure has changed and the candidate needs to be re-evaluated with the new criteria.
When re-ranking is requested, the system identifies all candidates with stale criteria hashes. Only these candidates are sent back to OpenAI for re-evaluation, saving time and API costs. After re-evaluation, all candidates are re-ranked using the updated scores. This ensures rankings stay accurate when job requirements change.

Database Design
We designed a flexible database schema using MongoDB. The users collection stores authentication information with hashed passwords. The jobs collection stores job postings with embedded criteria arrays, where each criterion includes name, description, weight, and data type. The candidates collection stores resume text, extracted AI data, calculated scores, and ranking information.
We created indexes on frequently queried fields to ensure fast performance. Indexes on jobId combined with overallScore, status, and rank allow efficient queries for ranked candidate lists. A text index on name and email enables search functionality. The flexible schema accommodates varying candidate information without requiring schema migrations.

Frontend Architecture
We built the frontend using React with a component-based architecture. The application is organized into pages for different views: dashboard, job management, candidate lists, and authentication. Reusable UI components handle common elements like tables, forms, buttons, and dialogs.
State management is handled by Zustand for global state like authentication and UI notifications, and React Query for server state like candidate lists and job data. React Query automatically caches API responses and handles loading and error states, reducing the need for manual state management.
The frontend uses React Router for navigation, creating a single-page application experience. Protected routes check authentication status and redirect unauthenticated users to the login page. The API client uses Axios with interceptors to automatically handle authentication tokens and token refresh.

Dashboard and Statistics
We created a dashboard that provides an overview of the recruiter's activity. The dashboard displays total jobs, total candidates, candidates by status, and top jobs by candidate count. Statistics are calculated by querying the database and aggregating counts and averages.
The dashboard updates automatically when data changes because React Query invalidates and refetches queries after mutations. This ensures the dashboard always shows current information without manual refresh.

Error Handling and Validation
We implemented comprehensive error handling throughout the system. The backend includes middleware that catches all errors and sends appropriate HTTP status codes and error messages. Different error types are handled specifically: validation errors, authentication errors, file upload errors, and database errors.
Input validation occurs at multiple levels. The frontend validates user input before sending requests. The backend validates all incoming data using Mongoose schema validation and custom validation logic. File uploads are validated for type and size both client-side and server-side.

Security Measures
We implemented several security measures. Passwords are hashed using bcrypt with salt rounds before storage. JWT tokens are signed with a secret key and include expiration times. Refresh tokens are stored in HTTP-only cookies that cannot be accessed by JavaScript. CORS is configured to only allow requests from approved origins.
The system validates user ownership before allowing access to jobs or candidates. All API routes that modify data require authentication. File uploads are limited by type and size to prevent abuse.

Installation Instructions

Prerequisites
Install the following software on your computer:
Node.js version 18 or higher
MongoDB version 6 or higher
Git
OpenAI API key

Downloading the Project
Open your terminal and navigate to the directory where you want to save the project. Run:
git clone https://github.com/nadeenhalabi1/projectPhaseB.git
Navigate into the project directory:
cd projectPhaseB

Installing Backend Dependencies
Navigate to the backend directory:
cd backend
Install all required packages:
npm install

Installing Frontend Dependencies
Navigate to the frontend directory:
cd ../frontend
Install all required packages:
npm install

Configuring Backend Environment Variables
Navigate to the backend directory:
cd ../backend
Create a new file named .env in the backend directory.
Add the following content to the .env file, replacing placeholder values with your actual values:
MONGODB_URI=mongodb://localhost:27017/cv-screening
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173

Configuring Frontend Environment Variables
Navigate to the frontend directory:
cd ../frontend
Create a new file named .env in the frontend directory.
Add the following content to the .env file:
VITE_API_URL=http://localhost:3001/api

Starting MongoDB
Open a new terminal window and start MongoDB:
mongod
Keep this terminal window open.

Starting the Backend Server
Open a new terminal window and navigate to the backend directory:
cd backend
Start the backend server:
npm run dev
Keep this terminal window open.

Starting the Frontend Development Server
Open another new terminal window and navigate to the frontend directory:
cd frontend
Start the frontend development server:
npm run dev

Accessing the Application
Open your web browser and navigate to http://localhost:5173. The application should load and display the login page.

