// prisma/seed.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'master2025';

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create the admin user
  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      nom: 'Admin', // Add the last name
      prenom: 'User', // Add the first name
      admin: {
        create: {}, // Create the associated Admin record
      },
    },
  });

  console.log('Admin user created:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });