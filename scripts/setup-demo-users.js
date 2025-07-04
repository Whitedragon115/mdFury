import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAndCreateDemoUsers() {
  try {
    console.log('Checking existing users...')
    
    // Check if users exist
    const existingUsers = await prisma.user.findMany()
    console.log(`Found ${existingUsers.length} existing users:`)
    existingUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email})`)
    })

    // Check for demo users specifically
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' }
    })

    // Create admin user if it doesn't exist
    if (!adminUser) {
      console.log('Creating admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@mdFury.local',
          password: hashedPassword,
          displayName: 'Administrator',
          language: 'en',
          theme: 'dark'
        }
      })
      console.log('Admin user created:', newAdmin.username)
    } else {
      console.log('Admin user already exists')
    }

    // Create demo user if it doesn't exist
    if (!demoUser) {
      console.log('Creating demo user...')
      const hashedPassword = await bcrypt.hash('demo123', 12)
      const newDemo = await prisma.user.create({
        data: {
          username: 'demo',
          email: 'demo@mdFury.local',
          password: hashedPassword,
          displayName: 'Demo User',
          language: 'en',
          theme: 'dark'
        }
      })
      console.log('Demo user created:', newDemo.username)
    } else {
      console.log('Demo user already exists')
    }

    console.log('Demo users setup completed!')
    
  } catch (error) {
    console.error('Error setting up demo users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateDemoUsers()
