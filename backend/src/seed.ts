import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.js'

const menuItems = [
  {
    name: 'Avocado toast',
    nameAm: 'አቮካዶ ቶስት',
    nameOr: 'Toastii Avokaadoo',
    description: 'Sourdough, smashed avocado, poached egg and chilli flakes.',
    descriptionAm: 'የስንዴ ዳቦ፣ የተፈጨ አቮካዶ፣ የተቀቀለ እንቁላል እና ቃሪያ።',
    descriptionOr: 'Daabboo qamadii, avokaadoo caccabee, hanqaaquu bilcheefamee fi burtukaana.',
    price: 9.5,
    category: 'Breakfast',
    imageUrl:
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Classic club sandwich',
    nameAm: 'ክላሲክ ክለብ ሳንድዊች',
    nameOr: 'Sandwichii Klabii Klassikii',
    description: 'Grilled chicken, crispy bacon, lettuce and tomato with fries.',
    price: 14.5,
    category: 'Main courses',
    imageUrl:
      'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Seabass & seasonal greens',
    nameAm: 'የባህር ዓሳ እና ወቅታዊ አረንጓዴ አትክልቶች',
    nameOr: 'Qurxummii Galaanaa fi Muduraa Yeroo',
    description: 'Pan-seared fillet, lemon butter and garden vegetables.',
    price: 22,
    category: 'Main courses',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Fresh garden salad',
    nameAm: 'ትኩስ የአትክልት ሰላጣ',
    nameOr: 'Salaada Maasiyaa Haaraa',
    description: 'Baby leaves, cucumber, tomatoes, feta and house dressing.',
    price: 11.5,
    category: 'Main courses',
    imageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Iced hibiscus tea',
    nameAm: 'ቀዝቃዛ የሂቢስከስ ሻይ',
    nameOr: 'Shaayii Hibiiskusii Qabbanaa’aa',
    description: 'Refreshing hibiscus infusion, citrus and mint.',
    price: 4.5,
    category: 'Drinks',
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Chocolate fondant',
    nameAm: 'የቸኮሌት ፎንዳንት',
    nameOr: 'Fondantii Shokolaataa',
    description: 'Warm dark chocolate cake with vanilla ice cream.',
    price: 8,
    category: 'Desserts',
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
  },
]

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the administrator.')
  }

  const existingHotel = await prisma.hotel.findFirst({ include: { users: true, categories: true } })
  if (existingHotel) {
    const categoryTranslations: Record<string, [string, string]> = {
      Breakfast: ['ቁርስ', 'Ciree'],
      'Main courses': ['ዋና ምግቦች', 'Nyaata Ijoo'],
      Drinks: ['መጠጦች', 'Dhugaatii'],
      Desserts: ['ጣፋጭ ምግቦች', 'Mi’aawaa'],
    }
    for (const category of existingHotel.categories) {
      const translated = categoryTranslations[category.name]
      if (translated) {
        await prisma.category.update({
          where: { id: category.id },
          data: { nameAm: translated[0], nameOr: translated[1] },
        })
      }
    }
    const existingItems = await prisma.menuItem.findMany({ where: { hotelId: existingHotel.id } })
    for (const existingItem of existingItems) {
      const translation = menuItems.find((item) => item.name === existingItem.name)
      if (translation) {
        await prisma.menuItem.update({
          where: { id: existingItem.id },
          data: {
            nameAm: translation.nameAm,
            nameOr: translation.nameOr,
            descriptionAm: translation.descriptionAm,
            descriptionOr: translation.descriptionOr,
          },
        })
      }
    }

    const existingAdmin = existingHotel.users.find((user) => user.role === 'ADMIN')
    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: adminEmail,
          passwordHash: await bcrypt.hash(adminPassword, 12),
        },
      })
      console.log(`Updated administrator ${adminEmail}.`)
    } else {
      await prisma.user.create({
        data: {
          hotelId: existingHotel.id,
          email: adminEmail,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: 'ADMIN',
        },
      })

      await prisma.table.createMany({
        data: [1, 2, 3, 4].map((number) => ({ hotelId: hotel.id, number: String(number), label: `Table ${number}` })),
      })
      console.log(`Created administrator ${adminEmail}.`)
    }
    return
  }

  const hotel = await prisma.hotel.create({
    data: {
      name: 'SYT hotel',
      categories: {
        create: [
          ['Breakfast', 'ቁርስ', 'Ciree'],
          ['Main courses', 'ዋና ምግቦች', 'Nyaata Ijoo'],
          ['Drinks', 'መጠጦች', 'Dhugaatii'],
          ['Desserts', 'ጣፋጭ ምግቦች', 'Mi’aawaa'],
        ].map(([name, nameAm, nameOr], index) => ({
            name,
            nameAm,
            nameOr,
            displayOrder: index,
          })),
      },
    },
    include: { categories: true },
  })

  const categoriesByName = new Map(
    hotel.categories.map((category) => [category.name, category.id]),
  )

  await prisma.menuItem.createMany({
    data: menuItems.map((item, index) => ({
      hotelId: hotel.id,
      categoryId: categoriesByName.get(item.category)!,
      name: item.name,
      nameAm: item.nameAm,
      nameOr: item.nameOr,
      description: item.description,
      descriptionAm: item.descriptionAm,
      descriptionOr: item.descriptionOr,
      price: item.price,
      imageUrl: item.imageUrl,
      displayOrder: index,
    })),
  })

  await prisma.user.create({
    data: {
      hotelId: hotel.id,
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
    },
  })

  console.log(`Seeded ${hotel.name} with ${menuItems.length} menu items.`)
}

seed()
  .catch((error) => {
    console.error('Database seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
