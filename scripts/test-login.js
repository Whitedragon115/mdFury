import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Simplified login test function
async function testLogin() {
  try {
    console.log('Testing login with admin credentials...')
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (!user) {
      console.log('❌ Admin user not found in database')
      return
    }
    
    console.log('✅ Admin user found:', user.username, user.email)
    
    // Test password
    const isPasswordValid = await bcrypt.compare('admin123', user.password)
    console.log('Password valid:', isPasswordValid)
    
    // Test demo user
    console.log('\nTesting demo user...')
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' }
    })
    
    if (!demoUser) {
      console.log('❌ Demo user not found in database')
      return
    }
    
    console.log('✅ Demo user found:', demoUser.username, demoUser.email)
    
    // Test password
    const isDemoPasswordValid = await bcrypt.compare('demo123', demoUser.password)
    console.log('Demo password valid:', isDemoPasswordValid)
    
  } catch (error) {
    console.error('Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
