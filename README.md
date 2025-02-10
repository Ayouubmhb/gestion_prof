# Gestion Prof App

Gestion Prof App is a comprehensive dashboard application designed for managing professors and educational resources. It provides an intuitive interface for administrators to handle various aspects of professor management, including profile updates, course assignments, and activity logging.

## Features

- User authentication (login, logout, password recovery)
- Dashboard with overview statistics
- Professor management (add, edit, delete, view)
- Course assignment and management
- Activity logging and export functionality
- User profile management
- Responsive design for desktop and mobile devices

## Technologies Used

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Prisma ORM
- MySQL database
- Recharts for data visualization
- React Hook Form for form handling
- Zod for schema validation
- jsPDF and XLSX for PDF and Excel export

## Setup Instructions

1. Clone the repository:
   \`\`\`
   git clone https://github.com/your-username/gestion-prof-app.git
   cd gestion-prof-app
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Set up your environment variables:
   Create a \`.env.local\` file in the root directory and add the following variables:
   \`\`\`
   DATABASE_URL="mysql://username:password@localhost:3306/gestion_prof_db"
   JWT_SECRET="your-secret-key-here"
   \`\`\`

4. Set up the database:
   \`\`\`
   npx prisma migrate dev
   \`\`\`

5. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

After setting up the project, you can:

1. Log in using the provided credentials or create a new account.
2. Navigate through the dashboard to view statistics and manage professors.
3. Add, edit, or delete professor profiles.
4. Assign courses to professors.
5. View and export activity logs.
6. Update your own profile and settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the \`LICENSE\` file for details.

## Support

If you encounter any problems or have any questions, please open an issue in the GitHub repository.
