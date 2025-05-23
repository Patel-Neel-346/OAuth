# OAuth Authentication System

A comprehensive authentication system that supports local username/password authentication as well as OAuth 2.0 social logins with Google and Facebook. Built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Multiple Authentication Methods**:
  - Local authentication with email and password
  - OAuth 2.0 with Google
  - OAuth 2.0 with Facebook
- 🔄 **JWT Token Management**:
  - Access tokens and refresh tokens
  - Secure token storage in HTTP-only cookies
- 📝 **User Management**:
  - User registration and login
  - User profile retrieval
  - Password encryption using bcrypt
- 📚 **API Documentation**:
  - Swagger UI integration for API exploration
  - Comprehensive endpoint documentation
- 🌐 **Frontend Integration**:
  - Test page for OAuth flows
  - Interactive authentication UI

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js, JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt for password hashing, HTTP-only cookies
- **Development**: Nodemon for auto-reloading

## Project Structure

```
├── public/                 # Static files
│   └── index.html          # OAuth testing dashboard
├── src/                    # Source code
│   ├── config/             # Configuration files
│   │   ├── DbConnect.js    # MongoDB connection
│   │   ├── index.js        # Environment variables
│   │   ├── passport.js     # Passport strategies
│   │   └── swagger.js      # API documentation
│   ├── controller/         # Controllers
│   │   └── authController.js # Authentication logic
│   ├── helpers/            # Helper functions
│   │   ├── ApiError.js     # Error handling
│   │   ├── ApiRespones.js  # Response formatting
│   │   └── asyncHandler.js # Async error handling
│   ├── middleware/         # Middleware
│   │   └── authMiddleware.js # Authentication middleware
│   ├── models/             # Database models
│   │   └── User.js         # User model
│   ├── routes/             # API routes
│   │   └── authRoutes.js   # Authentication routes
│   ├── utils/              # Utility functions
│   │   └── tokenUtils.js   # JWT token utilities
│   └── app.js              # Main application file
├── .env                    # Environment variables (not tracked in git)
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/oauth-authentication-system.git
   cd oauth-authentication-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=7000
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=oauth_auth
   JWT_SECRET_ACCESS_TOKEN=your_access_token_secret
   JWT_EXPIRES_IN=1h
   JWT_EXPIRES_REFRESH_SECRET=your_refresh_token_secret
   JWT_EXPIRES_REFRESH_EXPIRES_IN=7d
   SESSION_SECRET=your_session_secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK=http://localhost:7000/auth/google/callback
   
   # Facebook OAuth
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK=http://localhost:7000/auth/facebook/callback
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Setting Up OAuth

### Google OAuth

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Navigate to "Credentials" and create OAuth client ID
4. Configure the consent screen
5. Add authorized JavaScript origins: `http://localhost:7000`
6. Add authorized redirect URIs: `http://localhost:7000/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add the Facebook Login product
4. Go to Settings > Basic to get your App ID and App Secret
5. Set your Valid OAuth Redirect URI to: `http://localhost:7000/auth/facebook/callback`
6. Copy the App ID and App Secret to your `.env` file

## API Endpoints

### Authentication

- **POST /auth/register** - Register a new user
- **POST /auth/login** - Login with email and password
- **POST /auth/logout** - Logout user
- **GET /auth/refresh-token** - Refresh access token
- **GET /auth/profile** - Get user profile

### OAuth

- **GET /auth/google** - Initiate Google OAuth flow
- **GET /auth/google/callback** - Google OAuth callback
- **GET /auth/facebook** - Initiate Facebook OAuth flow
- **GET /auth/facebook/callback** - Facebook OAuth callback
- **GET /auth/success** - OAuth success redirect

## Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:7000/api-docs
```

## Testing

A testing dashboard is available at:
```
http://localhost:7000
```

This dashboard provides an interactive interface to test the authentication flows, including:
- OAuth login with Google and Facebook
- Email/password registration and login
- Session management
- API interaction

## Security Considerations

- Passwords are hashed using bcrypt before storing in the database
- Authentication tokens are stored in HTTP-only cookies
- Session data is stored server-side
- CORS is properly configured for API access

## License

MIT

## Author

Neel Patel
