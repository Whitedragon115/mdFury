// Script to create anonymous user for public mode
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAnonymousUser() {
  try {
    console.log('Creating anonymous user...')
    
    // Check if anonymous user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'anonymous@mdfury.local' }
    })

    if (existingUser) {
      console.log('Anonymous user already exists:', existingUser.id)
      return existingUser
    }

    // Create anonymous user
    const anonymousUser = await prisma.user.create({
      data: {
        email: 'anonymous@mdfury.local',
        username: 'anonymous',
        displayName: 'Anonymous User',
        name: 'Anonymous User',
        theme: 'dark',
        language: 'en'
      }
    })

    console.log('Anonymous user created successfully:', anonymousUser.id)
    return anonymousUser
  } catch (error) {
    console.error('Error creating anonymous user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  createAnonymousUser()
    .then(() => {
      console.log('Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Failed:', error)
      process.exit(1)
    })
}

module.exports = { createAnonymousUser }
