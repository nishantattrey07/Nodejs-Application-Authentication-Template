# Node.js Application Authentication Template

This Node.js Application Authentication Template is designed to provide a robust foundation for building secure and scalable web applications. It simplifies the process of adding authentication and user management functionalities to your Node.js applications.

## Features

- **User Registration**: Allows new users to create an account by providing their details.
- **User Login**: Enables registered users to log in using their credentials.
- **Password Encryption**: Ensures that user passwords are securely stored using advanced hashing techniques.
- **JWT Authentication**: Utilizes JSON Web Tokens (JWT) for secure and efficient user authentication.
- **Email Verification**:(upcoming) Sends an email to users to verify their account upon registration.
- **Password Reset**:(upcoming) Offers a password reset feature for users who have forgotten their passwords.

## Detailed Features

### User Registration

Users can sign up by providing their personal information, such as email, username, and password. The system validates the provided information and creates a new user account.

### User Login

Registered users can log in to the application using their username and password. Upon successful authentication, the system grants access token.

### Password Encryption

The application uses [argon2](https://github.com/ranisalt/node-argon2") for password hashing, ensuring that user passwords are never stored in plain text in the database. This adds an extra layer of security against unauthorized access.

### JWT Authentication

After successful login, the application issues a JSON Web Token (JWT) to the user. This token is used for authenticating subsequent requests, allowing users to access protected routes and resources.

### Email Verification

Upon registration, the system sends a verification email to the user's provided email address. Users must click the verification link to activate their account, enhancing security and reducing spam accounts.

### Password Reset(upcoming)

If a user forgets their password, they can request a password reset. The system sends a reset link to the user's email, allowing them to set a new password securely.

## Database Configuration

This project supports both MongoDB and MySQL, allowing you to select the database that best suits your project's needs. To configure your database, you must create a `.env` file in the root directory of your project and specify the following environment variables based on your chosen database:

```properties
db_type="<DATABASE_TYPE>"
mongodb="<MONGODB_CONNECTION_STRING>"
jwt_secret="<YOUR_JWT_SECRET>"
mysql_host="<MYSQL_HOST>"
mysql_username="<MYSQL_USERNAME>"
mysql_password="<MYSQL_PASSWORD>"
mysql_database="<MYSQL_DATABASE_NAME>"
```

If you choose MongoDB, set db_type to "mongodb" and provide your MongoDB connection string in the mongodb variable. The MySQL-related variables should be present but can be left empty.

### MongoDB Configuration
Example for MongoDB:
```properties
db_type="mongodb"
mongodb="mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/YourDatabase"
jwt_secret="YourSecretKey"
mysql_host=""
mysql_username=""
mysql_password=""
mysql_database=""
```
### MySQL Configuration
For MySQL, set db_type to "mysql" and fill in the mysql_host, mysql_username, mysql_password, and mysql_database with your MySQL database details. The mongodb variable should be present but can be left empty.

Example for MySQL:
```properties
db_type="mysql"
mongodb=""
jwt_secret="YourSecretKey"
mysql_host="localhost"
mysql_username="root"
mysql_password="yourpassword"
mysql_database="YourDatabaseName"
```



## Getting Started

To use this template, clone the repository and install the required dependencies:

```bash
git clone https://github.com/your-repository/Nodejs-Application-Authentication-Template.git
cd Nodejs-Application-Authentication-Template
npm install .

