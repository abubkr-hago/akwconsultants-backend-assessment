# AKW Consultants Backend

A robust backend system for a KYC compliance workﬂow application, includes
authentication, role-based access control, KYC management, and reporting.
mongoose and passport.

## Usage

    git clone https://github.com/abubkr-hago/akwconsultants-backend-assessment.git
    cd akwconsultants-backend-assessment

copy the .env.example file to .env and fill in the required values

    npm run dev

## Project Structure

    src\
    |--config\         # Environment variables and configuration related things
    |--controllers\    # Route controllers (controller layer)
    |--docs\           # Swagger files
    |--middlewares\    # Custom express middlewares
    |--models\         # Mongoose models (data layer)
    |--routes\         # Routes
    |--services\       # Business logic (service layer)
    |--utils\          # Utility classes and functions
    |--validations\    # Request data validation schemas
    |--app.js          # Express app
    |--index.js        # App entry point

## API Documentation

To view the list of available APIs and their specifications, run the server and
go to `http://localhost:3000/v1/docs` in your browser. This documentation page
is automatically generated using the [swagger](https://swagger.io/) definitions
written as comments in the route files.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify email

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:userId` - get user\
`PATCH /v1/users/:userId` - update user\
`DELETE /v1/users/:userId` - delete user\

**Kyc Submissions routes**:\
`GET /v1/kyc-submissions` - get all submissions (adminsOnly)\
`POST /v1/kyc-submissions/:kycSubmissionId` - get submission by id (adminsOnly)\
`POST /v1/kyc-submissions` - submit kyc for users\
`PATCH /v1/kyc-submissions` - patch kyc submission status (adminsOnly)\

**Files routes**:\
`GET /v1/files/fileId` - stream file by id

## License

Apache-2.0
