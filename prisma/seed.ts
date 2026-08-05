import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { categories, suppliers, products } from "../src/data/mock-products"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Clear existing data
  console.log("🗑️  Clearing existing data...")
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.user.deleteMany()

  // Create Categories
  console.log(`📦 Creating ${categories.length} categories...`)
  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || "Package",
        color: cat.color || null,
        description: cat.description || null,
      },
    })
    categoryMap[cat.slug] = created.id
  }
  console.log(`✅ Created ${categories.length} categories`)

  // Create Suppliers
  console.log(`🏭 Creating ${suppliers.length} suppliers...`)
  const supplierMap: Record<string, string> = {}
  for (const sup of suppliers) {
    const created = await prisma.supplier.create({
      data: {
        name: sup.name,
        slug: sup.slug,
        color: sup.color || null,
      },
    })
    supplierMap[sup.name] = created.id
  }
  console.log(`✅ Created ${suppliers.length} suppliers`)

  // Create Products
  console.log(`📦 Creating ${products.length} products...`)
  let created = 0
  let skipped = 0

  for (const product of products) {
    const categoryId = categoryMap[product.category]
    const supplierId = supplierMap[product.supplier]

    if (!categoryId) {
      console.warn(`⚠️  Category "${product.category}" not found for product "${product.name}" - skipping`)
      skipped++
      continue
    }

    try {
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          sku: product.sku || null,
          description: product.description || "",
          price: product.price,
          comparePrice: product.comparePrice || null,
          cost: product.cost || null,
          margin: product.margin || null,
          unit: product.unit || "UNIDAD",
          minStock: product.minStock || 0,
          status: product.status || "ACTIVE",
          stock: product.stock || 0,
          images: product.images || [],
          specs: product.specs || {},
          isNew: product.isNew || false,
          isFeatured: product.isFeatured || false,
          categoryId,
          supplierId: supplierId || null,
        },
      })
      created++
    } catch (error: any) {
      if (error.code === "P2002") {
        console.warn(`⚠️  Duplicate slug/sku for "${product.name}" - skipping`)
        skipped++
      } else {
        console.error(`❌ Error creating product "${product.name}":`, error.message)
        skipped++
      }
    }
  }
  console.log(`✅ Created ${created} products (${skipped} skipped)`)

  // Create Admin User
  console.log("👤 Creating admin user...")
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@energyMSI.com",
      password: "$2b$10$xsSrc3i9rvBX.uLhXeaMteDUia8iKTnIgt8SoPwY9MFMopOux4G5.", // password: admin123
      name: "Admin User",
      phone: "+51 999 888 777",
      role: "ADMIN",
      status: "ACTIVE",
    },
  })
  console.log(`✅ Created admin user: ${adminUser.email}`)

  // Create Test Customer
  console.log("👤 Creating test customer...")
  const customerUser = await prisma.user.create({
    data: {
      email: "juan@email.com",
      password: "$2b$10$xsSrc3i9rvBX.uLhXeaMteDUia8iKTnIgt8SoPwY9MFMopOux4G5.", // password: admin123
      name: "Juan Perez",
      phone: "+51 987 654 321",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  })
  console.log(`✅ Created customer: ${customerUser.email}`)

  // Create Address for Customer
  await prisma.address.create({
    data: {
      label: "Casa",
      name: "Juan Perez",
      phone: "+51 987 654 321",
      address: "Av. Javier Prado 1234",
      city: "Lima",
      state: "Lima",
      zipCode: "15036",
      isDefault: true,
      userId: customerUser.id,
    },
  })
  console.log("✅ Created address for customer")

  console.log("\n🎉 Seed completed!")
  console.log(`📊 Summary: ${categories.length} categories, ${suppliers.length} suppliers, ${created} products, 2 users`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
