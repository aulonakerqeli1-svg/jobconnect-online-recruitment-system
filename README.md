# JobConnect – Online Recruitment and Application Management System

JobConnect is a full-stack web application designed to simplify and centralize the recruitment process by connecting job seekers, companies, and administrators through a secure and user-friendly platform.
The system enables companies to publish job opportunities, candidates to search and apply for available positions, and administrators to review and approve job postings before they become publicly available.

## Features

### Authentication and User Management
- User registration and login.
- Role-based authentication and authorization.
- Secure password hashing using bcrypt.
- Token-based authentication.
- Separate dashboards and permissions for each user role.

### Candidate Features
- Create and manage personal profiles.
- Upload profile pictures.
- Browse and search available job opportunities.
- Filter jobs by title, location, and department.
- Apply for jobs by uploading a CV (PDF or Word).
- Submit optional cover letters.
- Track application statuses.

### Company Features
- Create and manage company profiles.
- Publish new job opportunities.
- Edit, close, and delete job postings.
- Review applications submitted by candidates.
- Update application statuses.
- Receive control over the recruitment process.

### Administrator Features
- Review submitted job postings.
- Approve or reject job opportunities.
- Provide rejection reasons.
- Manage and filter job postings and applications.
- Access a statistical dashboard.
- Monitor recruitment activity across the platform.

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Backend | PHP 8+ |
| Database | MySQL |
| Database Access | PDO |
| API Architecture | REST API |
| Data Format | JSON |
| Authentication | Bearer Token |
| Development Environment | XAMPP |

## System Architecture
JobConnect follows a three-tier architecture:
1. **Frontend:** React handles the user interface, navigation, forms, and user interactions.
2. **Backend:** PHP handles business logic, authentication, authorization, validation, file uploads, and API requests.
3. **Database:** MySQL stores users, companies, candidates, job categories, job postings, applications, and authentication tokens.

The frontend and backend communicate through REST API endpoints using HTTP requests and JSON responses.

## User Roles

| Role | Description |
|---|---|
| Candidate | Searches for jobs, manages a profile, submits applications, and tracks application progress. |
| Company | Manages company information, publishes job postings, and reviews applications. |
| Administrator | Moderates job postings, manages recruitment activity, and monitors system statistics. |

## Security
Security is an important part of the JobConnect implementation.
The system includes:
- Password hashing using PHP `password_hash()` with bcrypt.
- Prepared statements through PDO to prevent SQL Injection.
- Token-based authentication with expiration.
- Role-based access control on protected API endpoints.
- Backend validation of user input.
- File upload restrictions for CVs and profile pictures.
- Protection against PHP file execution in the uploads directory.
- CORS configuration for frontend-backend communication.

## Database Structure

The database consists of seven main tables:

- `users` – Authentication details and user roles.
- `companies` – Company profiles.
- `candidates` – Candidate profiles and professional information.
- `job_categories` – Job departments and categories.
- `job_postings` – Published and moderated job opportunities.
- `applications` – Candidate applications and their statuses.
- `auth_tokens` – Active authentication tokens and expiration dates.

## Installation and Setup

### Prerequisites
Make sure you have installed:

- XAMPP (Apache, PHP 8+, MySQL).
- Node.js and npm.
- Git.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/jobconnect-online-recruitment-system.git

cd jobconnect-online-recruitment-system
```

### 2. Configure the Database
1. Start Apache and MySQL through XAMPP.
2. Open phpMyAdmin.
3. Import the SQL file located in `database/schema.sql`.
4. Configure the database connection in the backend configuration file.

Update the database credentials according to your local environment.

### 3. Configure the Backend
1. Copy the `backend` folder into the XAMPP `htdocs` directory.
2. Configure the database connection.
3. Ensure the uploads directory has the required write permissions.
4. Start Apache and MySQL.

### 4. Configure the Frontend
Navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at:
`http://localhost:5173`
Make sure the frontend API configuration points to your local PHP backend.

## Application Workflow

The main recruitment workflow follows these steps:

1. A company registers and creates its profile.
2. The company submits a new job posting.
3. The administrator reviews and approves the posting.
4. The approved job becomes visible to candidates.
5. Candidates submit applications with their CVs.
6. Companies review applications and update their statuses.
7. Candidates receive email notifications when their applications are accepted or rejected.

## Testing
The application was tested manually using browser-based testing and direct HTTP requests with cURL.
The testing process covered:
- Registration and authentication.
- Role-based access restrictions.
- Company and candidate profile management.
- Job posting creation and moderation.
- Job search and filtering.
- CV and profile picture uploads.
- Application submission and status management.
- Email notifications.
- Administrator statistics.

Security scenarios were also tested, including unauthorized requests, incorrect user roles, and attempts to bypass job approval restrictions.

## Future Improvements
Potential future enhancements include:
- Email verification.
- Password recovery functionality.
- Automated testing using PHPUnit and Jest.
- Improved email delivery through SMTP and PHPMailer.
- Job recommendations based on candidate profiles.
- Direct messaging between candidates and companies.
- Additional data encryption and security improvements.

## Project Information
**Project Name:** JobConnect  
**Project Type:** Bachelor's Degree Project  
**Field of Study:** Professional Programming  
**Institution:** Faculty of Computer Science  
**Academic Year:** 2026  
**Developed by:** Aulona Kërqeli  
**Mentor:** Prof. Nida Santuri

---

*JobConnect – Connecting Talent with Opportunities.*
