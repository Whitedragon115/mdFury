const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupDemo() {
  try {
    console.log('Checking database connection...')
    
    // Check if demo users exist
    const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } })
    const demoExists = await prisma.user.findUnique({ where: { username: 'demo' } })

    console.log('Admin user exists:', !!adminExists)
    console.log('Demo user exists:', !!demoExists)

    if (!adminExists) {
      console.log('Creating admin user...')
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          displayName: 'Administrator',
          language: 'en',
          theme: 'system'
        }
      })
      console.log('Admin user created successfully!')
    }

    if (!demoExists) {
      console.log('Creating demo user...')
      await prisma.user.create({
        data: {
          username: 'demo',
          email: 'demo@example.com',
          password: await bcrypt.hash('demo123', 10),
          displayName: 'Demo User',
          language: 'en',
          theme: 'system'
        }
      })
      console.log('Demo user created successfully!')
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        createdAt: true
      }
    })

    console.log('\nAll users in database:')
    console.table(allUsers)

  } catch (error) {
    console.error('Error setting up demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDemo()
