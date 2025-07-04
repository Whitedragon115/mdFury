// Test script to check database connection and demo users
import { prisma } from './src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function testLogin() {
  try {
    console.log('Testing database connection...')
    
    // Check if demo users exist
    console.log('\nChecking for demo users...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        createdAt: true
      }
    })
    
    console.log('Found users:', users)
    
    // Test login with demo credentials
    console.log('\nTesting demo login...')
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' }
    })
    
    if (demoUser) {
      console.log('Demo user found:', {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email
      })
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare('demo123', demoUser.password)
      console.log('Password verification result:', isPasswordValid)
    } else {
      console.log('Demo user not found')
    }
    
    // Test admin login
    console.log('\nTesting admin login...')
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (adminUser) {
      console.log('Admin user found:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email
      })
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare('admin123', adminUser.password)
      console.log('Password verification result:', isPasswordValid)
    } else {
      console.log('Admin user not found')
    }
    
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
