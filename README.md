
# School Timetable Generator

A web application for generating and managing school timetables.

## Project info

This project uses:
- React with TypeScript for the frontend
- PHP and MySQL for the backend
- PHPMyAdmin for database management

## Setup Instructions

### Backend Setup:

1. Install a local web server with PHP (like XAMPP, WAMP, or MAMP)
2. Start your web server and MySQL services
3. Open PHPMyAdmin (usually at http://localhost/phpmyadmin)
4. Create a new database named `timetable_db`
5. Import the `api/db_setup.sql` file to create the database schema
6. Copy the `api` folder to your web server's document root (e.g., `htdocs` for XAMPP)

### Frontend Setup:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Update API_URL in src/contexts/AuthContext.tsx and DataContext.tsx if needed
# Default is http://localhost/timetable/api

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Default Login

- Email: youremail@example.com 
- Password: yourpassword

## Database Configuration

You can change database connection settings in `api/config/database.php`:

```php
private $host = "localhost";
private $db_name = "timetable_db";
private $username = "root";
private $password = "";
```

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- PHP
- MySQL
