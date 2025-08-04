import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Skapa exempel företag
  const company = await prisma.company.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company AB',
      slug: 'demo-company',
      domain: 'demo.com',
      settings: {
        emailSignature: 'Med vänliga hälsningar,\nDemo Company AB',
        timezone: 'Europe/Stockholm',
      },
    },
  })

  console.log('✅ Created company:', company.name)

  // Skapa exempel taggar
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name_companyId: { name: 'VIP', companyId: company.id } },
      update: {},
      create: { name: 'VIP', color: '#DC2626', companyId: company.id },
    }),
    prisma.tag.upsert({
      where: { name_companyId: { name: 'Varm Lead', companyId: company.id } },
      update: {},
      create: { name: 'Varm Lead', color: '#EAB308', companyId: company.id },
    }),
    prisma.tag.upsert({
      where: { name_companyId: { name: 'Stor Kund', companyId: company.id } },
      update: {},
      create: { name: 'Stor Kund', color: '#059669', companyId: company.id },
    }),
  ])

  console.log('✅ Created tags:', tags.map(t => t.name).join(', '))

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
