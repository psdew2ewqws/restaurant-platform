const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating test companies and super admin...')

  try {
    // Check if companies exist
    const existingCompanies = await prisma.company.findMany()
    console.log(`Found ${existingCompanies.length} existing companies`)

    if (existingCompanies.length === 0) {
      // Create test companies
      const companies = [
        {
          name: 'Pizza Palace',
          slug: 'pizza-palace',
          businessType: 'restaurant',
          timezone: 'Asia/Amman',
          defaultCurrency: 'JOD',
          status: 'active',
        },
        {
          name: 'Burger Kingdom',
          slug: 'burger-kingdom', 
          businessType: 'restaurant',
          timezone: 'Asia/Amman',
          defaultCurrency: 'JOD',
          status: 'active',
        },
        {
          name: 'Coffee Corner',
          slug: 'coffee-corner',
          businessType: 'cafe',
          timezone: 'Asia/Amman', 
          defaultCurrency: 'JOD',
          status: 'trial',
        }
      ]

      for (const company of companies) {
        const createdCompany = await prisma.company.create({ data: company })
        console.log(`Created company: ${createdCompany.name}`)
      }
    }

    // Check if super admin exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin' }
    })

    if (!existingSuperAdmin) {
      // Create super admin user
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12)
      
      const superAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@platform.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          password: hashedPassword,
          status: 'active'
          // No companyId for super admin
        }
      })
      console.log(`Created super admin: ${superAdmin.email}`)
    } else {
      console.log('Super admin already exists')
    }

    console.log('Test data creation completed!')
  } catch (error) {
    console.error('Error creating test data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()